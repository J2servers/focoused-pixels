import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

// ===== TYPES =====
interface ProductPayload {
  external_id: string;
  name: string;
  sku?: string;
  price: number;
  promotional_price?: number;
  stock?: number;
  cost_material?: number;
  cost_labor?: number;
  cost_shipping?: number;
  category_slug?: string;
  status?: string;
}

interface SalePayload {
  external_order_id: string;
  items: Array<{
    product_sku?: string;
    product_slug?: string;
    product_id?: string;
    quantity: number;
    unit_price: number;
  }>;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method?: string;
  total: number;
  notes?: string;
}

interface StockUpdatePayload {
  product_sku?: string;
  product_slug?: string;
  product_id?: string;
  new_stock: number;
  reason?: string;
}

interface WebhookRequest {
  event: string; // product.sync | sale.created | stock.update | products.list | orders.list | stock.list
  data: ProductPayload | SalePayload | StockUpdatePayload | Record<string, unknown>;
  timestamp?: string;
}

// ===== HELPERS =====
function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `PL${y}${m}${d}-${rand}`;
}

async function logWebhook(
  supabase: any,
  direction: string,
  endpoint: string,
  eventType: string,
  requestBody: unknown,
  responseBody: unknown,
  statusCode: number,
  source: string,
  processed: boolean,
  errorMessage?: string
) {
  try {
    await supabase.from("webhook_logs").insert({
      direction,
      endpoint,
      event_type: eventType,
      request_body: requestBody as Record<string, unknown>,
      response_body: responseBody as Record<string, unknown>,
      status_code: statusCode,
      source,
      processed,
      error_message: errorMessage || null,
    });
  } catch (e) {
    console.error("[Webhook Log Error]", e);
  }
}

async function validateApiKey(supabase: any, apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.length < 8) return false;
  
  const prefix = apiKey.substring(0, 8);
  
  // Find key by prefix
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key_hash, is_active, expires_at, permissions")
    .eq("key_prefix", prefix)
    .eq("is_active", true)
    .limit(1);

  if (error || !data || data.length === 0) return false;

  const keyRecord = data[0];
  
  // Verify hash matches
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(apiKey));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (computedHash !== keyRecord.key_hash) return false;
  
  // Check expiration
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) return false;

  // Update last_used_at
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id);

  return true;
}

// ===== EVENT HANDLERS =====

async function handleProductSync(supabase: any, data: ProductPayload) {
  const slug = data.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if product exists by SKU or slug
  let existingProduct = null;
  if (data.sku) {
    const { data: found } = await supabase
      .from("products")
      .select("id")
      .eq("sku", data.sku)
      .is("deleted_at", null)
      .limit(1)
      .single();
    existingProduct = found;
  }

  if (!existingProduct) {
    const { data: found } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .limit(1)
      .single();
    existingProduct = found;
  }

  const productData = {
    name: data.name,
    slug,
    sku: data.sku || null,
    price: data.price,
    promotional_price: data.promotional_price || null,
    stock: data.stock ?? 0,
    cost_material: data.cost_material ?? 0,
    cost_labor: data.cost_labor ?? 0,
    cost_shipping: data.cost_shipping ?? 0,
    status: data.status || "active",
  };

  if (existingProduct) {
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", existingProduct.id);
    if (error) throw error;
    return { action: "updated", product_id: existingProduct.id };
  } else {
    const { data: newProduct, error } = await supabase
      .from("products")
      .insert(productData)
      .select("id")
      .single();
    if (error) throw error;
    return { action: "created", product_id: newProduct.id };
  }
}

async function handleSaleCreated(supabase: any, data: SalePayload) {
  const orderNumber = generateOrderNumber();
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      payment_method: data.payment_method || "crm",
      payment_status: "paid",
      order_status: "confirmed",
      total: data.total,
      subtotal: data.total,
      notes: `CRM External ID: ${data.external_order_id}. ${data.notes || ""}`,
      items: data.items as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  // Process each item: create order_items + decrease stock
  for (const item of data.items) {
    // Find product
    let productId = item.product_id || null;
    let productName = "Produto CRM";

    if (!productId && item.product_sku) {
      const { data: p } = await supabase
        .from("products").select("id, name, stock").eq("sku", item.product_sku).is("deleted_at", null).limit(1).single();
      if (p) { productId = p.id; productName = p.name; }
    }
    if (!productId && item.product_slug) {
      const { data: p } = await supabase
        .from("products").select("id, name, stock").eq("slug", item.product_slug).is("deleted_at", null).limit(1).single();
      if (p) { productId = p.id; productName = p.name; }
    }

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      product_name: productName,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    });

    // Decrease stock
    if (productId) {
      const { data: currentProduct } = await supabase
        .from("products").select("stock").eq("id", productId).single();
      if (currentProduct) {
        const newStock = Math.max(0, (currentProduct.stock || 0) - item.quantity);
        await supabase.from("products").update({ stock: newStock }).eq("id", productId);
      }
    }
  }

  return { action: "order_created", order_id: order.id, order_number: orderNumber };
}

async function handleStockUpdate(supabase: any, data: StockUpdatePayload) {
  let query = supabase.from("products").select("id, name, stock").is("deleted_at", null);
  
  if (data.product_id) query = query.eq("id", data.product_id);
  else if (data.product_sku) query = query.eq("sku", data.product_sku);
  else if (data.product_slug) query = query.eq("slug", data.product_slug);
  else throw new Error("product_id, product_sku or product_slug is required");

  const { data: product, error } = await query.limit(1).single();
  if (error || !product) throw new Error("Product not found");

  await supabase.from("products").update({ stock: data.new_stock }).eq("id", product.id);

  return { action: "stock_updated", product_id: product.id, old_stock: product.stock, new_stock: data.new_stock };
}

async function handleProductsList(supabase: any, filters: Record<string, unknown>) {
  let query = supabase
    .from("products")
    .select("id, name, slug, sku, price, promotional_price, stock, min_stock, cost_material, cost_labor, cost_shipping, status, cover_image, category_id, created_at, updated_at")
    .is("deleted_at", null)
    .order("name");

  if (filters?.status) query = query.eq("status", filters.status as string);
  if (filters?.category_id) query = query.eq("category_id", filters.category_id as string);
  if (filters?.limit) query = query.limit(filters.limit as number);

  const { data, error } = await query;
  if (error) throw error;

  return { products: data, total: data?.length || 0 };
}

async function handleOrdersList(supabase: any, filters: Record<string, unknown>) {
  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, total, order_status, payment_status, payment_method, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("order_status", filters.status as string);
  if (filters?.limit) query = query.limit(filters.limit as number);
  else query = query.limit(100);

  const { data, error } = await query;
  if (error) throw error;

  return { orders: data, total: data?.length || 0 };
}

async function handleStockList(supabase: any, filters: Record<string, unknown>) {
  let query = supabase
    .from("products")
    .select("id, name, sku, slug, stock, min_stock, price, status")
    .is("deleted_at", null)
    .eq("status", "active")
    .order("stock", { ascending: true });

  if (filters?.low_stock_only) {
    // Will filter client-side since we can't do stock <= min_stock in supabase-js easily
  }
  if (filters?.limit) query = query.limit(filters.limit as number);

  const { data, error } = await query;
  if (error) throw error;

  let results = data || [];
  if (filters?.low_stock_only) {
    results = results.filter(p => (p.stock || 0) <= (p.min_stock || 5));
  }

  return { products: results, total: results.length };
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey) as any;

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key") || "";
    const isValid = await validateApiKey(supabase, apiKey);
    
    if (!isValid) {
      const errorResp = { error: "Invalid or missing API key", code: "UNAUTHORIZED" };
      await logWebhook(supabase, "inbound", "/crm-webhook", "auth_failed", {}, errorResp, 401, "unknown", false, "Invalid API key");
      return new Response(JSON.stringify(errorResp), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as WebhookRequest;
    const { event, data, timestamp } = body;

    console.log(`[CRM Webhook] Event: ${event}, Timestamp: ${timestamp || "none"}`);

    let result: Record<string, unknown>;

    switch (event) {
      case "product.sync":
        result = await handleProductSync(supabase, data as ProductPayload);
        break;
      case "sale.created":
        result = await handleSaleCreated(supabase, data as SalePayload);
        break;
      case "stock.update":
        result = await handleStockUpdate(supabase, data as StockUpdatePayload);
        break;
      case "products.list":
        result = await handleProductsList(supabase, (data || {}) as Record<string, unknown>);
        break;
      case "orders.list":
        result = await handleOrdersList(supabase, (data || {}) as Record<string, unknown>);
        break;
      case "stock.list":
        result = await handleStockList(supabase, (data || {}) as Record<string, unknown>);
        break;
      default:
        throw new Error(`Unknown event: ${event}`);
    }

    const response = { success: true, event, result, processed_at: new Date().toISOString() };

    await logWebhook(supabase, "inbound", "/crm-webhook", event, body, response, 200, "crm", true);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[CRM Webhook] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorResp = { success: false, error: errorMessage };

    await logWebhook(supabase, "inbound", "/crm-webhook", "error", {}, errorResp, 500, "crm", false, errorMessage);

    return new Response(JSON.stringify(errorResp), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
