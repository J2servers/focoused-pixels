-- Add unique constraint on whatsapp_templates.name for upsert support
ALTER TABLE public.whatsapp_templates ADD CONSTRAINT whatsapp_templates_name_unique UNIQUE (name);