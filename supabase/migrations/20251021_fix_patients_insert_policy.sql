-- ============================================
-- FIX: Políticas RLS para tabela patients
-- Data: 2025-10-21
-- Descrição: Permite que médicos e admins autenticados criem pacientes
-- ============================================

-- Drop política antiga
DROP POLICY IF EXISTS "Authenticated users can create patients" ON patients;

-- Criar nova política mais específica para INSERT
CREATE POLICY "Doctors and admins can create patients"
ON patients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role::text IN ('DOCTOR', 'MEDICO', 'ADMIN')
  )
);

-- Adicionar política para UPDATE (caso necessário no futuro)
DROP POLICY IF EXISTS "Doctors and admins can update patients" ON patients;

CREATE POLICY "Doctors and admins can update patients"
ON patients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role::text IN ('DOCTOR', 'MEDICO', 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role::text IN ('DOCTOR', 'MEDICO', 'ADMIN')
  )
);

COMMENT ON POLICY "Doctors and admins can create patients" ON patients IS
'Permite que médicos e administradores autenticados criem novos pacientes';

COMMENT ON POLICY "Doctors and admins can update patients" ON patients IS
'Permite que médicos e administradores autenticados atualizem dados de pacientes';
