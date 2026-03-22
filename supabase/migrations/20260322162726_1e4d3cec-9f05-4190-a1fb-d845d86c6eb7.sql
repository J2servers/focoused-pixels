
-- Workflow execution tracking table
CREATE TABLE public.workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  trigger_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  next_run_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  error_message text,
  step_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for the cron processor
CREATE INDEX idx_workflow_executions_pending ON public.workflow_executions(status, next_run_at) WHERE status IN ('pending', 'running');
CREATE INDEX idx_workflow_executions_workflow ON public.workflow_executions(workflow_id);

-- RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow executions"
  ON public.workflow_executions FOR ALL
  USING (has_admin_access(auth.uid()));

CREATE POLICY "System can insert executions"
  ON public.workflow_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update executions"
  ON public.workflow_executions FOR UPDATE
  USING (true);

-- Update trigger
CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON public.workflow_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
