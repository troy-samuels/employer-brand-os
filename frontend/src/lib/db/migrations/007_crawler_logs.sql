-- Migration 007: AI crawler visit logging
-- Tracks which AI bots visit company sites, enabling the crawler dashboard.

CREATE TABLE IF NOT EXISTS crawler_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  page_url TEXT NOT NULL,
  could_read BOOLEAN NOT NULL DEFAULT true,
  response_served BOOLEAN NOT NULL DEFAULT false,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crawler_visits_company ON crawler_visits(company_id);
CREATE INDEX idx_crawler_visits_bot ON crawler_visits(bot_name);
CREATE INDEX idx_crawler_visits_time ON crawler_visits(visited_at);

ALTER TABLE crawler_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service write crawler_visits" ON crawler_visits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Org read crawler_visits" ON crawler_visits FOR SELECT USING (true);
