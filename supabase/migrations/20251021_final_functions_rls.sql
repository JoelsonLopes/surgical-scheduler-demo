-- ============================================
-- MIGRATION PART 3: Functions, Views, RLS Policies
-- Execute este arquivo no Supabase Dashboard SQL Editor
-- ============================================

-- ============================================
-- Create Conflict Check Function
-- ============================================

CREATE OR REPLACE FUNCTION check_appointment_conflicts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = NEW.doctor_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status NOT IN ('CANCELADO', 'REJEITADO')
    AND (
      (NEW.start_date_time >= start_date_time AND NEW.start_date_time < end_date_time)
      OR (NEW.end_date_time > start_date_time AND NEW.end_date_time <= end_date_time)
      OR (NEW.start_date_time <= start_date_time AND NEW.end_date_time >= end_date_time)
    )
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: o médico já possui um agendamento neste horário';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_appointment_conflicts ON appointments;
CREATE TRIGGER validate_appointment_conflicts
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION check_appointment_conflicts();

-- ============================================
-- Create Helper Function for Available Slots
-- ============================================

CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_doctor_id UUID,
  p_date DATE,
  p_start_hour INTEGER DEFAULT 7,
  p_end_hour INTEGER DEFAULT 14,
  p_slot_duration INTEGER DEFAULT 30
)
RETURNS TABLE (
  time_slot TEXT,
  is_available BOOLEAN
)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  v_current_time TIME;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
BEGIN
  FOR h IN p_start_hour..(p_end_hour - 1) LOOP
    FOR m IN 0..59 BY p_slot_duration LOOP
      v_current_time := make_time(h, m, 0);
      v_slot_start := (p_date + v_current_time)::TIMESTAMPTZ;
      v_slot_end := v_slot_start + (p_slot_duration || ' minutes')::INTERVAL;
      time_slot := to_char(v_current_time, 'HH24:MI');
      is_available := NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = p_doctor_id
        AND status NOT IN ('CANCELADO', 'REJEITADO')
        AND (
          (v_slot_start >= start_date_time AND v_slot_start < end_date_time)
          OR (v_slot_end > start_date_time AND v_slot_end <= end_date_time)
          OR (v_slot_start <= start_date_time AND v_slot_end >= end_date_time)
        )
      );
      RETURN NEXT;
    END LOOP;
  END LOOP;
END;
$function$;

-- ============================================
-- Create Views
-- ============================================

CREATE OR REPLACE VIEW pending_appointments_summary AS
SELECT
  a.id,
  a.start_date_time,
  a.end_date_time,
  a.procedure,
  a.status,
  u.name AS doctor_name,
  u.email AS doctor_email,
  p.name AS patient_name,
  p.phone AS patient_phone,
  a.insurance,
  a.created_at
FROM appointments a
JOIN users u ON a.doctor_id = u.id
JOIN patients p ON a.patient_id = p.id
WHERE a.status = 'PENDING'
ORDER BY a.created_at DESC;

CREATE OR REPLACE VIEW confirmed_appointments_calendar AS
SELECT
  a.id,
  a.start_date_time,
  a.end_date_time,
  a.procedure,
  u.name AS doctor_name,
  p.name AS patient_name,
  a.special_needs,
  DATE(a.start_date_time) AS appointment_date
FROM appointments a
JOIN users u ON a.doctor_id = u.id
JOIN patients p ON a.patient_id = p.id
WHERE a.status = 'CONFIRMADO'
ORDER BY a.start_date_time;

-- ============================================
-- Enable RLS
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies - Patients
-- ============================================

DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
CREATE POLICY "Admins can view all patients"
ON patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
CREATE POLICY "Doctors can view their patients"
ON patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE patient_id = patients.id
    AND doctor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can create patients" ON patients;
CREATE POLICY "Authenticated users can create patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- Create RLS Policies - Appointments
-- ============================================

DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
CREATE POLICY "Admins can view all appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
CREATE POLICY "Doctors can view their appointments"
ON appointments FOR SELECT
TO authenticated
USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can create appointments" ON appointments;
CREATE POLICY "Doctors can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can update their pending appointments" ON appointments;
CREATE POLICY "Doctors can update their pending appointments"
ON appointments FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid() AND status = 'PENDING')
WITH CHECK (doctor_id = auth.uid() AND status = 'PENDING');

DROP POLICY IF EXISTS "Admins can update all appointments" ON appointments;
CREATE POLICY "Admins can update all appointments"
ON appointments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Doctors can delete their pending appointments" ON appointments;
CREATE POLICY "Doctors can delete their pending appointments"
ON appointments FOR DELETE
TO authenticated
USING (doctor_id = auth.uid() AND status = 'PENDING');

-- ============================================
-- Create RLS Policies - History
-- ============================================

DROP POLICY IF EXISTS "Users can view history of their appointments" ON appointment_history;
CREATE POLICY "Users can view history of their appointments"
ON appointment_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_history.appointment_id
    AND (
      doctor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
    )
  )
);

-- ============================================
-- Create RLS Policies - Documents
-- ============================================

DROP POLICY IF EXISTS "Users can view documents of their appointments" ON appointment_documents;
CREATE POLICY "Users can view documents of their appointments"
ON appointment_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_documents.appointment_id
    AND (
      doctor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
    )
  )
);

DROP POLICY IF EXISTS "Users can upload documents to their appointments" ON appointment_documents;
CREATE POLICY "Users can upload documents to their appointments"
ON appointment_documents FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_documents.appointment_id
    AND doctor_id = auth.uid()
  )
);

-- ============================================
-- Grant Permissions
-- ============================================

GRANT USAGE ON TYPE appointment_status TO authenticated;
GRANT USAGE ON TYPE insurance_type TO authenticated;
GRANT USAGE ON TYPE history_action TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;
GRANT SELECT ON appointment_history TO authenticated;
GRANT SELECT, INSERT ON appointment_documents TO authenticated;
GRANT SELECT ON pending_appointments_summary TO authenticated;
GRANT SELECT ON confirmed_appointments_calendar TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_time_slots TO authenticated;

-- ============================================
-- Migration Complete!
-- ============================================

SELECT 'Migration part 3 completed successfully!' AS status;
