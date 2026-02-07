CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_key text UNIQUE NOT NULL,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rate_limits_bucket ON rate_limits (bucket_key);
CREATE INDEX idx_rate_limits_expires ON rate_limits (expires_at);
