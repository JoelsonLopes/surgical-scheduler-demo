-- ============================================
-- MIGRATION: Create Storage Bucket for Appointment Documents
-- Date: 2025-10-27
-- Description: Creates Supabase Storage bucket and RLS policies for patient documents
-- ============================================

-- Create storage bucket for appointment documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('appointment-documents', 'appointment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR STORAGE
-- ============================================

-- Policy: Allow authenticated users to upload documents
CREATE POLICY "Users can upload appointment documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'appointment-documents'
  AND auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to view documents
CREATE POLICY "Users can view their appointment documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'appointment-documents'
  AND auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to delete documents
CREATE POLICY "Users can delete their appointment documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'appointment-documents'
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- NOTES
-- ============================================
-- - Bucket is private (public = false)
-- - Documents are linked to appointments via appointment_documents table
-- - File URLs stored in appointment_documents.file_url
-- - RLS policies restrict access to authenticated users only
-- - Additional authorization checks in application layer (API routes)
