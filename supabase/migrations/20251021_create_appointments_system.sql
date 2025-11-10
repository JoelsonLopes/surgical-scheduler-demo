-- ============================================
-- MIGRATION: Create Appointments System
-- Description: Complete database structure for surgical scheduling
-- Date: 2025-10-21
-- ============================================

-- ============================================
-- STEP 1: Create ENUM Types
-- ============================================

-- Enum for appointment status
CREATE TYPE appointment_status AS ENUM (
  'PENDING',      -- Aguardando aprovação do admin
  'CONFIRMADO',   -- Aprovado pelo admin
  'REJEITADO',    -- Rejeitado pelo admin
  'CANCELADO',    -- Cancelado
  'CONCLUIDO'     -- Cirurgia realizada
);

-- Enum for insurance types
CREATE TYPE insurance_type AS ENUM (
  'BRADESCO_SAUDE',
  'MEDSENIOR',
  'CABERGS_SAUDE',
  'POSTAL_SAUDE',
  'UNIMED',
  'DANAMED',
  'SUL_AMERICA'
);

-- Enum for history actions (if not exists)
DO $$ BEGIN
  CREATE TYPE history_action AS ENUM (
    'CREATED',
    'UPDATED',
    'STATUS_CHANGED',
    'CANCELLED',
    'COMPLETED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE appointment_status IS 'Status do agendamento cirúrgico';
COMMENT ON TYPE insurance_type IS 'Tipos de convênio aceitos';
COMMENT ON TYPE history_action IS 'Ações de histórico de agendamentos';

-- ============================================
-- STEP 2: Create Patients Table
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),

  CONSTRAINT patients_phone_format CHECK (phone ~ '^\(\d{2}\) \d{5}-\d{4}$'),
  CONSTRAINT patients_cpf_format CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$')
);

COMMENT ON TABLE patients IS 'Informações dos pacientes';
COMMENT ON COLUMN patients.name IS 'Nome completo do paciente';
COMMENT ON COLUMN patients.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN patients.phone IS 'Telefone no formato (XX) XXXXX-XXXX';
COMMENT ON COLUMN patients.cpf IS 'CPF no formato XXX.XXX.XXX-XX';

-- ============================================
-- STEP 3: Create Appointments Table
-- ============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,

  -- Appointment Details
  procedure TEXT NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  estimated_duration INTERVAL GENERATED ALWAYS AS (end_date_time - start_date_time) STORED,

  -- Patient & Insurance
  insurance insurance_type NOT NULL,
  special_needs TEXT,

  -- Status & Approval
  status appointment_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Additional Info
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),

  -- Constraints
  CONSTRAINT appointments_end_after_start CHECK (end_date_time > start_date_time),
  CONSTRAINT appointments_duration_minimum CHECK (end_date_time - start_date_time >= INTERVAL '30 minutes'),
  CONSTRAINT appointments_rejection_reason_required CHECK (
    (status != 'REJEITADO') OR (rejection_reason IS NOT NULL)
  ),
  CONSTRAINT appointments_approved_by_required CHECK (
    (status NOT IN ('CONFIRMADO', 'REJEITADO')) OR (approved_by IS NOT NULL)
  )
);

COMMENT ON TABLE appointments IS 'Agendamentos de cirurgias';
COMMENT ON COLUMN appointments.doctor_id IS 'Médico responsável pela cirurgia';
COMMENT ON COLUMN appointments.patient_id IS 'Paciente que será operado';
COMMENT ON COLUMN appointments.procedure IS 'Descrição do procedimento cirúrgico';
COMMENT ON COLUMN appointments.start_date_time IS 'Data e hora de início da cirurgia';
COMMENT ON COLUMN appointments.end_date_time IS 'Data e hora de término estimado';
COMMENT ON COLUMN appointments.estimated_duration IS 'Duração calculada automaticamente';
COMMENT ON COLUMN appointments.special_needs IS 'Necessidades especiais (equipamentos, anestesista, etc)';
COMMENT ON COLUMN appointments.approved_by IS 'Admin que aprovou/rejeitou';
COMMENT ON COLUMN appointments.rejection_reason IS 'Motivo da rejeição (obrigatório se rejeitado)';

-- ============================================
-- STEP 4: Create Appointment History Table
-- ============================================

CREATE TABLE appointment_history (
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
COMMENT ON COLUMN appointment_history.appointment_id IS 'Agendamento relacionado';
COMMENT ON COLUMN appointment_history.changed_by IS 'Usuário que fez a mudança';
COMMENT ON COLUMN appointment_history.action IS 'Tipo de ação realizada';
COMMENT ON COLUMN appointment_history.old_status IS 'Status anterior';
COMMENT ON COLUMN appointment_history.new_status IS 'Novo status';

-- ============================================
-- STEP 5: Create Appointment Documents Table
-- ============================================

CREATE TABLE appointment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE appointment_documents IS 'Documentos anexados aos agendamentos (exames, laudos, etc)';
COMMENT ON COLUMN appointment_documents.file_url IS 'URL do arquivo no storage';
COMMENT ON COLUMN appointment_documents.file_size IS 'Tamanho do arquivo em bytes';

-- ============================================
-- STEP 6: Create Indexes for Performance
-- ============================================

-- Indexes for appointments
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_date_time ON appointments(start_date_time);
CREATE INDEX idx_appointments_date_range ON appointments(start_date_time, end_date_time);

-- Composite index for conflict detection
CREATE INDEX idx_appointments_conflict_check ON appointments(doctor_id, start_date_time, end_date_time)
WHERE status NOT IN ('CANCELADO', 'REJEITADO');

-- Indexes for history
CREATE INDEX idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_created_at ON appointment_history(created_at DESC);

-- Indexes for documents
CREATE INDEX idx_appointment_documents_appointment_id ON appointment_documents(appointment_id);

-- Index for patients
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);

-- ============================================
-- STEP 7: Create Triggers
-- ============================================

-- Trigger to update updated_at on patients
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create history on appointment changes
CREATE TRIGGER create_appointment_history_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION public.create_appointment_history();

-- ============================================
-- STEP 8: Create Function to Check Conflicts
-- ============================================

CREATE OR REPLACE FUNCTION check_appointment_conflicts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Verificar se há conflitos de horário para o mesmo médico
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = NEW.doctor_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status NOT IN ('CANCELADO', 'REJEITADO')
    AND (
      -- Novo agendamento começa durante um existente
      (NEW.start_date_time >= start_date_time AND NEW.start_date_time < end_date_time)
      OR
      -- Novo agendamento termina durante um existente
      (NEW.end_date_time > start_date_time AND NEW.end_date_time <= end_date_time)
      OR
      -- Novo agendamento engloba um existente
      (NEW.start_date_time <= start_date_time AND NEW.end_date_time >= end_date_time)
    )
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: o médico já possui um agendamento neste horário';
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION check_appointment_conflicts IS 'Valida conflitos de horário para o mesmo médico';

-- ============================================
-- STEP 9: Create Conflict Validation Trigger
-- ============================================

CREATE TRIGGER validate_appointment_conflicts
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION check_appointment_conflicts();

-- ============================================
-- STEP 10: Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 11: Create RLS Policies
-- ============================================

-- Policies for patients table
CREATE POLICY "Admins can view all patients"
ON patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

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

CREATE POLICY "Authenticated users can create patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policies for appointments table
CREATE POLICY "Admins can view all appointments"
ON appointments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Doctors can view their appointments"
ON appointments FOR SELECT
TO authenticated
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their pending appointments"
ON appointments FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid() AND status = 'PENDING')
WITH CHECK (doctor_id = auth.uid() AND status = 'PENDING');

CREATE POLICY "Admins can update all appointments"
ON appointments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "Doctors can delete their pending appointments"
ON appointments FOR DELETE
TO authenticated
USING (doctor_id = auth.uid() AND status = 'PENDING');

-- Policies for appointment_history table
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

-- Policies for appointment_documents table
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
-- STEP 12: Create Helper Functions
-- ============================================

-- Function to get available time slots
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

COMMENT ON FUNCTION get_available_time_slots IS 'Retorna slots de horário disponíveis para um médico em uma data específica';

-- ============================================
-- STEP 13: Create Views for Common Queries
-- ============================================

-- View for pending appointments
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

COMMENT ON VIEW pending_appointments_summary IS 'Resumo de agendamentos pendentes de aprovação';

-- View for confirmed appointments by date
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

COMMENT ON VIEW confirmed_appointments_calendar IS 'Calendário de agendamentos confirmados';

-- ============================================
-- STEP 14: Grant Permissions
-- ============================================

-- Grant usage on types
GRANT USAGE ON TYPE appointment_status TO authenticated;
GRANT USAGE ON TYPE insurance_type TO authenticated;
GRANT USAGE ON TYPE history_action TO authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;
GRANT SELECT ON appointment_history TO authenticated;
GRANT SELECT, INSERT ON appointment_documents TO authenticated;

-- Grant permissions on views
GRANT SELECT ON pending_appointments_summary TO authenticated;
GRANT SELECT ON confirmed_appointments_calendar TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_available_time_slots TO authenticated;

-- ============================================
-- Migration Complete!
-- ============================================
