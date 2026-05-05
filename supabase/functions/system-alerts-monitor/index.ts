import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("system-alerts-monitor");

interface AlertSettings {
  id: string;
  recipient_email: string | null;
  cron_failure_enabled: boolean;
  pending_notification_enabled: boolean;
  pending_threshold_minutes: number;
  cooldown_minutes: number;
  last_cron_alert_at: string | null;
  last_pending_alert_at: string | null;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function sendAlertEmail(to: string, subject: string, html: string) {
  const supabase = getSupabase();
  const { error } = await supabase.functions.invoke("send-email", {
    body: { action: "send", to, subject, html, from_name: "Alertas do Sistema" },
  });
  if (error) throw error;
}

function buildHtml(title: string, intro: string, rows: string[]): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;background:#fff;color:#222">
    <h1 style="color:#7E23B6;font-size:22px;margin:0 0 12px">${title}</h1>
    <p style="font-size:14px;color:#555;margin:0 0 18px">${intro}</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${rows.map(r => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${r}</td></tr>`).join("")}
    </table>
    <p style="margin-top:24px;font-size:12px;color:#888">Pincel de Luz — Monitor automático</p>
  </div>`;
}

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;

  try {
    const supabase = getSupabase();
    const { data: settings } = await supabase
      .from("system_alert_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<AlertSettings>();

    if (!settings || !settings.recipient_email) {
      return new Response(JSON.stringify({ skipped: "no_recipient" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const cooldownMs = settings.cooldown_minutes * 60_000;
    const results: Record<string, unknown> = {};

    // 1) Cron failures in the last hour
    if (settings.cron_failure_enabled) {
      const lastAlert = settings.last_cron_alert_at ? new Date(settings.last_cron_alert_at).getTime() : 0;
      if (now - lastAlert >= cooldownMs) {
        const since = new Date(now - 60 * 60_000).toISOString();
        const { data: failed } = await supabase
          .from("system_cron_runs")
          .select("job_name, started_at, finished_at, error")
          .eq("status", "failed")
          .gte("started_at", since)
          .order("started_at", { ascending: false })
          .limit(20);

        if (failed && failed.length > 0) {
          const rows = failed.map(f =>
            `<strong>${f.job_name}</strong> — ${new Date(f.started_at).toLocaleString("pt-BR")}<br/><span style="color:#b00">${(f.error || "Sem detalhes").slice(0, 240)}</span>`
          );
          await sendAlertEmail(
            settings.recipient_email,
            `🚨 ${failed.length} cron(s) falharam na última hora`,
            buildHtml("Falhas em Crons", `Detectamos ${failed.length} execução(ões) com erro nos últimos 60 minutos.`, rows),
          );
          await supabase.from("system_alert_settings").update({ last_cron_alert_at: new Date().toISOString() }).eq("id", settings.id);
          results.cron_alert_sent = failed.length;
        }
      } else {
        results.cron_skipped = "cooldown";
      }
    }

    // 2) Pending notifications past threshold
    if (settings.pending_notification_enabled) {
      const lastAlert = settings.last_pending_alert_at ? new Date(settings.last_pending_alert_at).getTime() : 0;
      if (now - lastAlert >= cooldownMs) {
        const cutoff = new Date(now - settings.pending_threshold_minutes * 60_000).toISOString();
        const { data: pending } = await supabase
          .from("notification_failures")
          .select("channel, event_name, recipient, attempts, last_error, created_at")
          .eq("resolved", false)
          .lte("created_at", cutoff)
          .order("created_at", { ascending: true })
          .limit(50);

        if (pending && pending.length > 0) {
          const rows = pending.map(p =>
            `<strong>${p.channel}/${p.event_name}</strong> → ${p.recipient || "—"}<br/><span style="color:#888;font-size:12px">${p.attempts} tentativa(s) · desde ${new Date(p.created_at).toLocaleString("pt-BR")}</span>${p.last_error ? `<br/><span style="color:#b00">${p.last_error.slice(0, 200)}</span>` : ""}`
          );
          await sendAlertEmail(
            settings.recipient_email,
            `⏳ ${pending.length} notificação(ões) pendente(s) há +${settings.pending_threshold_minutes}min`,
            buildHtml("Notificações Pendentes", `Existem ${pending.length} notificação(ões) não entregues há mais de ${settings.pending_threshold_minutes} minutos.`, rows),
          );
          await supabase.from("system_alert_settings").update({ last_pending_alert_at: new Date().toISOString() }).eq("id", settings.id);
          results.pending_alert_sent = pending.length;
        }
      } else {
        results.pending_skipped = "cooldown";
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    log.error("monitor_failed", { error: String(e) });
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
