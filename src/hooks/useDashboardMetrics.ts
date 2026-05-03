import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  startOfDay, startOfWeek, startOfMonth, startOfYear, daysAgo,
} from './useDashboardMetricsHelpers';
import { DashboardSources, DateBoundaries, TaxSettings } from './dashboard/types';
import { computeSales } from './dashboard/computeSales';
import { computeOperations } from './dashboard/computeOperations';
import { computeCharts } from './dashboard/computeCharts';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics-full'],
    queryFn: async () => {
      const [
        { data: orders }, { data: products }, { data: categories },
        { data: quotes }, { data: leads }, { data: reviews },
        { data: promotions }, { data: coupons }, { data: pageViews },
        { data: cashTx }, { data: rawMaterials }, { data: stockMovements },
        { data: whatsappMsgs }, { data: whatsappInstances },
        { data: auditLogs }, { data: webhookLogs },
        { data: orderItems }, { data: taxSettings }, { data: heroSlides },
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').is('deleted_at', null),
        supabase.from('categories').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*'),
        supabase.from('promotions').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('page_views').select('*').gte('created_at', daysAgo(30).toISOString()),
        supabase.from('cash_transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('raw_materials').select('*'),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('whatsapp_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('whatsapp_instances').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('order_items').select('*'),
        supabase.from('company_tax_settings').select('*').maybeSingle(),
        supabase.from('hero_slides').select('*'),
      ]);

      const all: DashboardSources = {
        orders: (orders || []) as DashboardSources['orders'],
        products: (products || []) as DashboardSources['products'],
        categories: (categories || []) as DashboardSources['categories'],
        quotes: (quotes || []) as DashboardSources['quotes'],
        leads: (leads || []) as DashboardSources['leads'],
        reviews: (reviews || []) as DashboardSources['reviews'],
        promotions: (promotions || []) as DashboardSources['promotions'],
        coupons: (coupons || []) as DashboardSources['coupons'],
        pageViews: (pageViews || []) as DashboardSources['pageViews'],
        cashTx: (cashTx || []) as DashboardSources['cashTx'],
        rawMaterials: (rawMaterials || []) as DashboardSources['rawMaterials'],
        stockMovements: (stockMovements || []) as DashboardSources['stockMovements'],
        whatsappMsgs: (whatsappMsgs || []) as DashboardSources['whatsappMsgs'],
        whatsappInstances: (whatsappInstances || []) as DashboardSources['whatsappInstances'],
        auditLogs: (auditLogs || []) as DashboardSources['auditLogs'],
        webhookLogs: (webhookLogs || []) as DashboardSources['webhookLogs'],
        orderItems: (orderItems || []) as DashboardSources['orderItems'],
        heroSlides: (heroSlides || []) as DashboardSources['heroSlides'],
      };

      const now = new Date();
      const dates: DateBoundaries = {
        now,
        todayStart: startOfDay(now),
        weekStart: startOfWeek(now),
        monthStart: startOfMonth(now),
        yearStart: startOfYear(now),
        lastMonthStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        lastMonthEnd: new Date(now.getFullYear(), now.getMonth(), 0),
        twelveMonthsAgo: new Date(now.getFullYear(), now.getMonth() - 12, 1),
      };

      const sales = computeSales(all, dates);
      const ops = computeOperations(all, dates, taxSettings as TaxSettings | null, sales);
      const charts = computeCharts(all, dates, sales, ops);

      return { ...sales.metrics, ...ops.metrics, ...charts };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
