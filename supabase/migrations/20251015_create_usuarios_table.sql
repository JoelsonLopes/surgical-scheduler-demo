-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('ADMIN', 'MEDICO');

-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'MEDICO',
  crm TEXT,
  especialidade TEXT,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  bloqueado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ultimo_login TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT crm_required_for_medico CHECK (
    role != 'MEDICO' OR (role = 'MEDICO' AND crm IS NOT NULL)
  )
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON public.usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON public.usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_crm ON public.usuarios(crm) WHERE crm IS NOT NULL;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar todos os usuários"
  ON public.usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Policy: Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: Usuários podem atualizar seu próprio perfil (campos limitados)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Não podem alterar role, ativo, ou bloqueado
    role = (SELECT role FROM public.usuarios WHERE id = auth.uid()) AND
    ativo = (SELECT ativo FROM public.usuarios WHERE id = auth.uid()) AND
    bloqueado = (SELECT bloqueado FROM public.usuarios WHERE id = auth.uid())
  );

-- Policy: Médicos podem ver outros médicos (para listagem de médicos)
CREATE POLICY "Médicos podem ver outros médicos"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (role = 'MEDICO' AND ativo = true AND bloqueado = false);

-- Comentários para documentação
COMMENT ON TABLE public.usuarios IS 'Tabela de usuários do sistema de gestão do bloco cirúrgico';
COMMENT ON COLUMN public.usuarios.id IS 'Identificador único do usuário (UUID)';
COMMENT ON COLUMN public.usuarios.email IS 'Email único do usuário para login';
COMMENT ON COLUMN public.usuarios.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.usuarios.role IS 'Papel do usuário no sistema (ADMIN ou MEDICO)';
COMMENT ON COLUMN public.usuarios.crm IS 'Número do CRM (obrigatório para médicos)';
COMMENT ON COLUMN public.usuarios.especialidade IS 'Especialidade médica';
COMMENT ON COLUMN public.usuarios.telefone IS 'Telefone de contato';
COMMENT ON COLUMN public.usuarios.ativo IS 'Indica se o usuário está ativo no sistema';
COMMENT ON COLUMN public.usuarios.bloqueado IS 'Indica se o usuário está bloqueado (por segurança)';
COMMENT ON COLUMN public.usuarios.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.usuarios.updated_at IS 'Data e hora da última atualização';
COMMENT ON COLUMN public.usuarios.ultimo_login IS 'Data e hora do último login do usuário';
