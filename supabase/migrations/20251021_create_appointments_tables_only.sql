-- ============================================
-- MIGRATION PART 2: Create Tables, Indexes, Triggers, RLS
-- Os ENUMs já foram criados, agora criar o resto
-- ============================================

-- Table patients já foi criada

-- ============================================
-- Create Appointments Table
-- ============================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  procedure TEXT NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  estimated_duration INTERVAL GENERATED ALWAYS AS (end_date_time - start_date_time) STORED,
  insurance insurance_type NOT NULL,
  special_needs TEXT,
  status appointment_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT appointments_end_after_start CHECK (end_date_time > start_date_time),
  CONSTRAINT appointments_duration_minimum CHECK (end_date_time - start_date_time >= INTERVAL '30 minutes'),
  CONSTRAINT appointments_rejection_reason_required CHECK ((status != 'REJEITADO') OR (rejection_reason IS NOT NULL)),
  CONSTRAINT appointments_approved_by_required CHECK ((status NOT IN ('CONFIRMADO', 'REJEITADO')) OR (approved_by IS NOT NULL))
);

COMMENT ON TABLE appointments IS 'Agendamentos de cirurgias';

-- ============================================
-- Create Appointment History Table
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action history_action NOT NULL,
  old_status appointment_status,
  new_status appointment_status,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE appointment_history IS 'Histórico de mudanças nos agendamentos';

-- ============================================
-- Create Appointment Documents Table
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE appointment_documents IS 'Documentos anexados aos agendamentos';

-- ============================================
-- Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_date_time ON appointments(start_date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_date_time, end_date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_conflict_check ON appointments(doctor_id, start_date_time, end_date_time) WHERE status NOT IN ('CANCELADO', 'REJEITADO');
CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_created_at ON appointment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointment_documents_appointment_id ON appointment_documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- ============================================
-- Create Triggers
-- ============================================

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS create_appointment_history_trigger ON appointments;
CREATE TRIGGER create_appointment_history_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION public.create_appointment_history();

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

SELECT 'Migration completed successfully!' AS status;
