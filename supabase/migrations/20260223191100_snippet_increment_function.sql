-- ============================================================
-- Helper function to increment snippet hit count
-- ============================================================

CREATE OR REPLACE FUNCTION increment_snippet_hits(
  p_slug text,
  p_domain text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE snippet_installs
  SET 
    hit_count = hit_count + 1,
    last_seen = now()
  WHERE 
    company_slug = p_slug
    AND (
      (p_domain IS NULL AND referrer_domain IS NULL)
      OR referrer_domain = p_domain
    );
END;
$$;
