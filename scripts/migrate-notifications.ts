import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

async function migrate() {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

    console.log('Creating picks_notifications table...');
    await sql`
        CREATE TABLE IF NOT EXISTS picks_notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            post_title TEXT,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    `;

    console.log('Enabling RLS...');
    await sql`ALTER TABLE picks_notifications ENABLE ROW LEVEL SECURITY;`;

    console.log('Creating RLS policies...');
    // Drop them first in case we rerun
    await sql`DROP POLICY IF EXISTS "Users can read own notifications" ON picks_notifications;`;
    await sql`DROP POLICY IF EXISTS "Users can update own notifications" ON picks_notifications;`;
    await sql`DROP POLICY IF EXISTS "Service role can do anything with notifications" ON picks_notifications;`;

    await sql`
        CREATE POLICY "Users can read own notifications" ON picks_notifications
        FOR SELECT USING (
            user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
        );
    `;

    await sql`
        CREATE POLICY "Users can update own notifications" ON picks_notifications
        FOR UPDATE USING (
            user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
        );
    `;

    await sql`
        CREATE POLICY "Service role can do anything with notifications" ON picks_notifications
        FOR ALL USING (auth.role() = 'service_role');
    `;

    console.log('Migration completed successfully.');
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
