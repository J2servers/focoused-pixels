// Shared types for workflow runtime
export interface WorkflowStep {
  id: string;
  type:
    | "send_email"
    | "send_whatsapp"
    | "delay"
    | "condition"
    | "check_status"
    | "schedule"
    | "loop"
    | "update_order_status"
    | "create_coupon"
    | "http_webhook"
    | "add_tag"
    | "wait_for_event";
  template_id?: string;
  template_name?: string;
  channel?: "email" | "whatsapp";
  delay_minutes?: number;
  delay_value?: number;
  delay_unit?: string;
  condition_label?: string;
  check_type?: string;
  schedule_hour?: number;
  schedule_minute?: number;
  max_loops?: number;
  loop_label?: string;
  source_handle?: string;
  yes_next_index?: number;
  no_next_index?: number;
  exit_next_index?: number;
  loop_next_index?: number;
  retry_count?: number;
  new_order_status?: string;
  new_payment_status?: string;
  coupon_type?: string;
  coupon_value?: number;
  coupon_duration_days?: number;
  coupon_prefix?: string;
  webhook_url?: string;
  webhook_method?: string;
  webhook_headers?: Record<string, string>;
  webhook_body_template?: string;
  tag_name?: string;
  tag_action?: string;
  wait_event?: string;
  wait_timeout_minutes?: number;
}

export type TriggerData = Record<string, unknown> & {
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  session_id?: string;
  order_id?: string;
  order_number?: string;
  amount?: string;
  total?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_cep?: string;
  coupon_code?: string;
  coupon_value?: string;
  expiration_date?: string;
  company_name?: string;
};

export interface StepResult {
  step_index: number;
  type: string;
  status?: string;
  timestamp: string;
  reason?: string;
  error?: string;
  channel?: string;
  [k: string]: unknown;
}

export interface ExecutionRow {
  id: string;
  workflow_id: string;
  trigger_data: TriggerData;
  current_step_index: number;
  status: string;
  next_run_at: string;
  step_results: StepResult[];
  started_at: string;
  completed_at?: string | null;
  automation_workflows?: { name?: string; trigger_event?: string; steps?: WorkflowStep[]; run_count?: number };
}
