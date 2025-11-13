# Configuração do Supabase Storage

## Bucket: appointment-documents

### Criação do Bucket

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'appointment-documents',
  'appointment-documents',
  true, -- Bucket público para permitir download via URL
  10485760, -- 10MB em bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);
```

### Políticas RLS

#### 1. Upload (INSERT)
Permite que médicos e admins façam upload de documentos:

```sql
CREATE POLICY "Médicos e admins podem fazer upload de documentos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'appointment-documents'
  AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('DOCTOR', 'MEDICO', 'ADMIN')
    )
  )
);
```

#### 2. Leitura (SELECT)
Permite que todos usuários autenticados visualizem documentos:

```sql
CREATE POLICY "Usuários autenticados podem ler documentos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'appointment-documents');
```

#### 3. Exclusão (DELETE)
Permite que médicos e admins deletem documentos:

```sql
CREATE POLICY "Médicos e admins podem deletar documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'appointment-documents'
  AND (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('DOCTOR', 'MEDICO', 'ADMIN')
    )
  )
);
```

## Configurações

- **Tamanho máximo por arquivo:** 10MB
- **Tipos de arquivo aceitos:**
  - PDF (application/pdf)
  - Imagens JPEG/PNG
  - Documentos Word (DOC, DOCX)
- **Visibilidade:** Público (URLs acessíveis diretamente)
- **RLS:** Habilitado com políticas de segurança

## APIs Relacionadas

- `POST /api/appointments/[id]/documents` - Upload de documentos
- `GET /api/appointments/[id]/documents` - Listar documentos
- `DELETE /api/appointments/documents/[docId]` - Deletar documento

## Fluxo de Upload

1. Médico cria agendamento
2. Frontend faz upload dos arquivos via FormData
3. API valida permissões (RLS)
4. Arquivo é salvo no bucket `appointment-documents`
5. URL pública é gerada automaticamente
6. Metadados salvos na tabela `appointment_documents`

## Segurança

- ✅ RLS habilitado em todas as operações
- ✅ Validação de tipo de arquivo
- ✅ Limite de tamanho configurado
- ✅ Apenas médicos e admins podem fazer upload/delete
- ✅ Todos usuários autenticados podem visualizar

## Data de Criação

**2025-11-13** - Configurado durante implementação do sistema de upload de documentos
