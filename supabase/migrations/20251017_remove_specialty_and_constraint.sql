ALTER TABLE public.users DROP COLUMN IF EXISTS specialty;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS medical_license_required_for_doctor;
