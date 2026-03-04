-- Allow users to delete quarters for their own games (needed when resetting a game)
CREATE POLICY "Users can delete quarters for own games" ON quarters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = quarters.game_id AND games.user_id = auth.uid())
  );
