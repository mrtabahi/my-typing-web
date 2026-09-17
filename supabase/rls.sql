-- ROW LEVEL SECURITY POLICIES

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- TESTS POLICIES
CREATE POLICY "Public Read Access for Active Tests" ON tests
    FOR SELECT USING (active = true);

CREATE POLICY "Admin Full Access on Tests" ON tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ATTEMPTS POLICIES
CREATE POLICY "Public Insert Access for Attempts" ON attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access for Leaderboard" ON attempts
    FOR SELECT USING (true);
