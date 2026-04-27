import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

interface EmailRequest {
  action?: "send" | "test_connection" | "send_test_email";
  to?: string;
  subject?: string;
  html?: string;
  from_name?: string;
}

interface EmailCredentials {
  email_enabled: boolean | null;
  business_email: string | null;
  sender_name: string | null;
  reply_to_email: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean | null;
  smtp_username: string | null;
  smtp_password: string | null;
  test_mode: boolean | null;
  test_recipient: string | null;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function getEmailConfig() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("email_credentials")
    .select(`
      email_enabled,
      business_email,
      sender_name,
      reply_to_email,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_username,
      smtp_password,
      test_mode,
      test_recipient
    `)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    return data as EmailCredentials;
  }

  if (!error) {
    throw new Error("Email credentials not configured");
  }

  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  if (!smtpUser || !smtpPassword) {
    throw new Error("Email credentials not configured");
  }

  return {
    email_enabled: true,
    business_email: smtpUser,
    sender_name: "Pincel de Luz",
    reply_to_email: null,
    smtp_host: "smtp.hostinger.com",
    smtp_port: 465,
    smtp_secure: true,
    smtp_username: smtpUser,
    smtp_password: smtpPassword,
    test_mode: false,
    test_recipient: null,
  } as EmailCredentials;
}

function ensureReadyConfig(config: EmailCredentials) {
  if (!config.smtp_host || !config.smtp_port || !config.smtp_username || !config.smtp_password) {
    throw new Error("SMTP credentials are incomplete");
  }
}

function createTransport(config: EmailCredentials) {
  ensureReadyConfig(config);
  return nodemailer.createTransport({
    host: config.smtp_host!,
    port: Number(config.smtp_port),
    secure: config.smtp_secure ?? Number(config.smtp_port) === 465,
    auth: {
      user: config.smtp_username!,
      pass: config.smtp_password!,
    },
  });
}

function buildSendTarget(config: EmailCredentials, request: EmailRequest) {
  const originalTo = request.to?.trim();
  const testModeEnabled = !!config.test_mode;
  const testRecipient = config.test_recipient?.trim();
  const action = request.action ?? "send";

  if (action === "send_test_email") {
    return {
      originalTo: originalTo || testRecipient || config.business_email || config.smtp_username,
      effectiveTo: originalTo || testRecipient || config.business_email || config.smtp_username,
      rerouted: false,
      subjectPrefix: "[TESTE] ",
    };
  }

  if (!originalTo) {
    throw new Error("Missing required field: to");
  }

  if (testModeEnabled) {
    if (!testRecipient) {
      throw new Error("Test mode is enabled but no test recipient is configured");
    }

    return {
      originalTo,
      effectiveTo: testRecipient,
      rerouted: true,
      subjectPrefix: `[TESTE para ${originalTo}] `,
    };
  }

  return {
    originalTo,
    effectiveTo: originalTo,
    rerouted: false,
    subjectPrefix: "",
  };
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const __pre = handlePreflight(req);
  if (__pre) return __pre;

  try {
    const request = await req.json() as EmailRequest;
    const action = request.action ?? "send";
    const config = await getEmailConfig();
    const transporter = createTransport(config);

    if (action === "test_connection") {
      await transporter.verify();
      return new Response(
        JSON.stringify({
          success: true,
          message: "SMTP connection verified",
          provider: config.smtp_host,
          port: config.smtp_port,
          secure: config.smtp_secure,
          testMode: !!config.test_mode,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "send" && !config.email_enabled) {
      throw new Error("Email sending is disabled");
    }

    const target = buildSendTarget(config, request);
    const senderName = request.from_name?.trim() || config.sender_name?.trim() || "Pincel de Luz";
    const senderEmail = config.business_email?.trim() || config.smtp_username?.trim();
    const subjectBase = request.subject?.trim() || "Teste de email";
    const htmlBody = request.html?.trim() || `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff7ed;">
        <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:16px;padding:24px;">
          <h2 style="margin:0 0 12px;color:#9a3412;">Teste de envio Hostinger Business</h2>
          <p style="margin:0 0 8px;color:#431407;">Se voce recebeu esta mensagem, a configuracao de email esta funcionando.</p>
          <p style="margin:0;color:#7c2d12;">Gerado automaticamente pela area administrativa da Pincel de Luz.</p>
        </div>
      </div>
    `;

    if (!senderEmail) {
      throw new Error("Business email is not configured");
    }

    const info = await transporter.sendMail({
      from: `${senderName} <${senderEmail}>`,
      to: target.effectiveTo,
      replyTo: config.reply_to_email?.trim() || undefined,
      subject: `${target.subjectPrefix}${subjectBase}`,
      html: htmlBody,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email processed for ${target.effectiveTo}`,
        originalTo: target.originalTo,
        effectiveTo: target.effectiveTo,
        rerouted: target.rerouted,
        testMode: !!config.test_mode,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SendEmail] Error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
