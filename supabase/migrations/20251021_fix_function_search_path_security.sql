-- Migration: Fix Function Search Path Security
-- Description: Add SET search_path to functions to prevent security vulnerabilities
-- Date: 2025-10-21

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix get_my_role function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT role::text FROM public.users WHERE id = auth.uid()
  );
END;
$function$;

-- Fix create_appointment_history function
CREATE OR REPLACE FUNCTION public.create_appointment_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public,auth'
AS $function$
DECLARE
  action_type public.history_action;
  user_id UUID;
BEGIN
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATED';
    user_id := NEW.doctor_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      action_type := 'STATUS_CHANGED';
      -- Determinar quem fez a mudança
      IF NEW.status = 'CONFIRMADO' OR NEW.status = 'REJEITADO' THEN
        user_id := NEW.approved_by;
      ELSE
        user_id := auth.uid();
      END IF;
    ELSE
      action_type := 'UPDATED';
      user_id := auth.uid();
    END IF;
  END IF;

  -- Inserir registro de histórico
  INSERT INTO public.appointment_history (
    appointment_id,
    changed_by,
    action,
    old_status,
    new_status,
    notes
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    user_id,
    action_type,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN NEW.status ELSE NULL END,
    CASE
      WHEN NEW.status = 'REJEITADO' THEN NEW.rejection_reason
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$function$;

-- Add comment to migration
COMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to update updated_at timestamp - search_path secured';
COMMENT ON FUNCTION public.get_my_role IS 'Returns the role of the current authenticated user - search_path secured';
COMMENT ON FUNCTION public.create_appointment_history IS 'Trigger function to create appointment history records - search_path secured';
