-- Games table: one active game per user
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
  current_year INT NOT NULL DEFAULT 1,
  current_quarter INT NOT NULL DEFAULT 1 CHECK (current_quarter >= 1 AND current_quarter <= 4),
  cash NUMERIC(14, 2) NOT NULL DEFAULT 1000000,
  engineers INT NOT NULL DEFAULT 4,
  sales_staff INT NOT NULL DEFAULT 2,
  quality NUMERIC(6, 2) NOT NULL DEFAULT 50,
  competitors INT NOT NULL DEFAULT 2,
  cumulative_profit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  UNIQUE(user_id)
);

-- Quarters table: game history
CREATE TABLE IF NOT EXISTS quarters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  year INT NOT NULL,
  quarter INT NOT NULL,
  -- Inputs
  price NUMERIC(14, 2) NOT NULL,
  new_engineers INT NOT NULL DEFAULT 0,
  new_sales INT NOT NULL DEFAULT 0,
  salary_pct NUMERIC(6, 2) NOT NULL,
  -- Outputs
  salary_cost_per_person NUMERIC(10, 2) NOT NULL,
  quality_after NUMERIC(6, 2) NOT NULL,
  demand NUMERIC(12, 4) NOT NULL,
  units_sold INT NOT NULL,
  revenue NUMERIC(14, 2) NOT NULL,
  total_payroll NUMERIC(14, 2) NOT NULL,
  net_income NUMERIC(14, 2) NOT NULL,
  hire_cost NUMERIC(14, 2) NOT NULL,
  cash_start NUMERIC(14, 2) NOT NULL,
  cash_end NUMERIC(14, 2) NOT NULL,
  engineers_end INT NOT NULL,
  sales_end INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_quarters_game_id ON quarters(game_id);
CREATE INDEX IF NOT EXISTS idx_quarters_game_year_quarter ON quarters(game_id, year, quarter);

-- Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;

-- Games: user can only access their own
CREATE POLICY "Users can view own games" ON games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games" ON games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games" ON games
  FOR DELETE USING (auth.uid() = user_id);

-- Quarters: user can only access via their games
CREATE POLICY "Users can view own quarters" ON quarters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = quarters.game_id AND games.user_id = auth.uid())
  );

CREATE POLICY "Users can insert quarters for own games" ON quarters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = quarters.game_id AND games.user_id = auth.uid())
  );

-- No updates allowed on quarters (immutable history)
-- No updates policy needed for quarters
