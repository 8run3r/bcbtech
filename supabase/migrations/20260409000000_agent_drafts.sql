-- Agent Drafts table — stores AI agent outputs
CREATE TABLE IF NOT EXISTS public.agent_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  input text NOT NULL,
  output text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent_email', 'posted_instagram', 'posted_linkedin', 'posted_facebook', 'sent_slack', 'sent_discord', 'sent_n8n')),
  platform text,          -- which platform was used for posting
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_drafts ENABLE ROW LEVEL SECURITY;

-- Only admins can CRUD
CREATE POLICY "Admin full access on agent_drafts"
  ON public.agent_drafts
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Index for fast queries
CREATE INDEX agent_drafts_agent_id_idx ON public.agent_drafts (agent_id);
CREATE INDEX agent_drafts_status_idx ON public.agent_drafts (status);
CREATE INDEX agent_drafts_created_at_idx ON public.agent_drafts (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_agent_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_drafts_updated_at
  BEFORE UPDATE ON public.agent_drafts
  FOR EACH ROW EXECUTE FUNCTION update_agent_drafts_updated_at();
