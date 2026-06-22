import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

async function migrate() {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

    console.log('Creating picks_reports table...');
    await sql`
        CREATE TABLE IF NOT EXISTS picks_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID NOT NULL REFERENCES picks_posts(id) ON DELETE CASCADE,
            reporter_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
            reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0),
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(post_id, reporter_id)
        );
    `;

    console.log('Enabling RLS...');
    await sql`ALTER TABLE picks_reports ENABLE ROW LEVEL SECURITY;`;

    console.log('Creating RLS policies...');
    // Drop them first in case we rerun
    await sql`DROP POLICY IF EXISTS "Anyone can read reports" ON picks_reports;`;
    await sql`DROP POLICY IF EXISTS "Authenticated users can create reports" ON picks_reports;`;
    await sql`DROP POLICY IF EXISTS "Service role can do anything with reports" ON picks_reports;`;

    await sql`CREATE POLICY "Anyone can read reports" ON picks_reports FOR SELECT USING (true);`;
    await sql`CREATE POLICY "Authenticated users can create reports" ON picks_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');`;
    await sql`CREATE POLICY "Service role can do anything with reports" ON picks_reports FOR ALL USING (auth.role() = 'service_role');`;

    console.log('Migration completed successfully.');
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
