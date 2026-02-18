/**
 * Supabase Setup & Migration Script (Direct PostgreSQL Connection)
 * 
 * This script:
 * 1. Creates database tables (team_members, events) via direct SQL
 * 2. Creates storage buckets (team-images, event-posters) via Supabase client
 * 3. Uploads all team member photos from public/ to Supabase Storage
 * 4. Uploads all event poster images from public/ to Supabase Storage
 * 5. Inserts all team member and event data into the database
 * 
 * Run: npm run setup:supabase
 */

import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const databaseUrl = process.env.DATABASE_URL!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
}
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

// Direct Postgres connection
const sql = postgres(databaseUrl);

// Supabase client (for storage only)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

// ── Helpers ───────────────────────────────────────────────────────

function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadImage(bucket: string, fileName: string, localPath: string): Promise<string | null> {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        const mimeType = getMimeType(localPath);

        // Remove existing file first (upsert)
        await supabase.storage.from(bucket).remove([fileName]);

        const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: true,
        });

        if (error) {
            console.error(`  ⚠ Upload error for ${fileName}:`, error.message);
            return null;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        console.log(`  ✅ Uploaded: ${fileName}`);
        return urlData.publicUrl;
    } catch (err: any) {
        console.error(`  ⚠ Failed to upload ${fileName}:`, err.message);
        return null;
    }
}

// ── Step 1: Create Database Tables ────────────────────────────────

async function createTables() {
    console.log('\n🗃️  Step 1: Creating database tables...');

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS team_members (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                image_url TEXT,
                github TEXT,
                linkedin TEXT,
                instagram TEXT,
                is_core_team BOOLEAN DEFAULT true,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('  ✅ Table "team_members" created/verified');

        await sql`
            CREATE TABLE IF NOT EXISTS events (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title TEXT NOT NULL,
                date DATE NOT NULL,
                time TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                type TEXT NOT NULL,
                attendees TEXT,
                status TEXT NOT NULL,
                image_url TEXT,
                poster_url TEXT,
                link TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        console.log('  ✅ Table "events" created/verified');

        // Enable RLS
        await sql`ALTER TABLE team_members ENABLE ROW LEVEL SECURITY`;
        await sql`ALTER TABLE events ENABLE ROW LEVEL SECURITY`;
        console.log('  ✅ Row Level Security enabled');

        // Create RLS policies (ignore if already exist)
        const policies = [
            { table: 'team_members', name: 'Allow public read team_members', action: 'SELECT' },
            { table: 'team_members', name: 'Allow all team_members', action: 'ALL' },
            { table: 'events', name: 'Allow public read events', action: 'SELECT' },
            { table: 'events', name: 'Allow all events', action: 'ALL' },
        ];

        for (const p of policies) {
            try {
                await sql.unsafe(`CREATE POLICY "${p.name}" ON ${p.table} FOR ${p.action} USING (true)`);
                console.log(`  ✅ Policy "${p.name}" created`);
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    console.log(`  ℹ Policy "${p.name}" already exists`);
                } else {
                    console.log(`  ⚠ Policy "${p.name}": ${e.message}`);
                }
            }
        }

        // Auto-update trigger
        await sql`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `;

        await sql`DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members`;
        await sql`
            CREATE TRIGGER update_team_members_updated_at
            BEFORE UPDATE ON team_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `;

        await sql`DROP TRIGGER IF EXISTS update_events_updated_at ON events`;
        await sql`
            CREATE TRIGGER update_events_updated_at
            BEFORE UPDATE ON events
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `;
        console.log('  ✅ Auto-update triggers created');

    } catch (error: any) {
        console.error('  ❌ Error creating tables:', error.message);
        throw error;
    }
}

// ── Step 2: Create Storage Buckets ────────────────────────────────

async function createBuckets() {
    console.log('\n📦 Step 2: Creating storage buckets...');

    const buckets = ['team-images', 'event-posters', 'event-photos'];

    for (const bucket of buckets) {
        const { data: existingBuckets } = await supabase.storage.listBuckets();
        const exists = existingBuckets?.some(b => b.name === bucket);

        if (exists) {
            console.log(`  ℹ Bucket "${bucket}" already exists`);
            await supabase.storage.updateBucket(bucket, { public: true });
            continue;
        }

        const { error } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 52428800,
        });

        if (error) {
            console.error(`  ❌ Error creating bucket "${bucket}":`, error.message);
        } else {
            console.log(`  ✅ Created bucket "${bucket}"`);
        }
    }
}

// ── Data ──────────────────────────────────────────────────────────

const coreTeam = [
    { name: "Rishnu Lal N", role: "Core Organizer", image: "Rishnu.jpg", github: "https://github.com/RISHNULAL", linkedin: "https://www.linkedin.com/in/rishnu-lal-n", instagram: "https://www.instagram.com/rishnulal__n" },
    { name: "Hussain Huzefa", role: "Co Organizer", image: "Hussain.jpeg", github: "https://github.com/husainsaifee53", linkedin: "https://www.linkedin.com/in/hussain-huzefa53", instagram: "https://www.instagram.com/husainnn_sf/" },
    { name: "Devapriya k", role: "CO Organizer", image: "Devapriya.jpg", github: "https://github.com/", linkedin: "https://www.linkedin.com/in/devapriya-k-8601b6370", instagram: "https://instagram.com/" },
    { name: "Roshith Krishna", role: "Finance Lead", image: "roshith.png", github: "https://github.com/Roshith-krishna", linkedin: "https://www.linkedin.com/in/roshith-krishna", instagram: "https://www.instagram.com/ro__shi__th/" },
    { name: "Anvar Sadath", role: "Design Lead", image: "Anwar.jpg", github: "https://github.com/", linkedin: "https://www.linkedin.com/in/anvar-sadath-aaa880333", instagram: "https://www.instagram.com/anvar_sdth" },
    { name: "Lakshmi Reji Suresh", role: "Women in Lead", image: "Lakshmi.jpg", github: "https://github.com/lakshmi-09-lrs", linkedin: "https://www.linkedin.com/in/lakshmi-suresh-751b35289", instagram: "https://www.instagram.com/_lakshmi_.09" },
    { name: "Rida Waseem", role: "Women in Lead", image: "Rida.jpeg", github: "https://github.com/Rida-007", linkedin: "https://www.linkedin.com/in/rida-waseem-a13389339", instagram: "https://www.instagram.com/rida_waseem_04" },
    { name: "Sayanth P", role: "Social Lead", image: "Sayanth.jpg", github: "https://github.com/Sayanthp2024", linkedin: "https://www.linkedin.com/in/sayanthp2025", instagram: "https://www.instagram.com/sa_y__x" },
    { name: "Ashwandha RJ", role: "CO finance Lead", image: "Aswandha.jpg", github: "https://github.com/aswandha123", linkedin: "https://www.linkedin.com/in/aswandha-rj-53b023328", instagram: "https://instagram.com/" },
    { name: "Muhammad Aswlah", role: "Designer", image: "Aswlah.jpg", github: "https://github.com/Aswlah01", linkedin: "https://www.linkedin.com/in/muhammed-aswlah", instagram: "https://www.instagram.com/" },
    { name: "Fathima P", role: "Designer", image: "Fathima.jpg", github: "https://github.com/", linkedin: "https://www.linkedin.com/in/fathima-mahamood-90b650342", instagram: "https://www.instagram.com/_faathimaahh__" },
    { name: "Sandra Sunil T", role: "Co social Lead", image: "sandra.jpg", github: "https://github.com/sandravtk06-jpg", linkedin: "https://www.linkedin.com/in/sandra-sunil-600321336", instagram: "https://instagram.com/" },
    { name: "Muhammed Sinan A P", role: "content Writer", image: "SINAN.jpg", github: "https://github.com/Sinaan-ms", linkedin: "https://www.linkedin.com/in/muhammedsinanap", instagram: "https://instagram.com/" },
];

const subTeam = [
    { name: "Adhi prajeesh", role: "Media Lead", image: "Aadhi.jpg", github: "https://www.github.com/adhxi-ttp", linkedin: "https://www.linkedin.com/in/adhi-prajeesh-982a86327/", instagram: "https://www.instagram.com/aaadhx.i" },
    { name: "Ananthanarayanan M", role: "Designer", image: "Ananthu.jpg", github: "https://github.com/ananthu-ananthu", linkedin: "https://www.linkedin.com/in/ananthanarayanan-m-18299a39b", instagram: "https://www.instagram.com/ana.nth_u" },
    { name: "Hemanth Sudhan C", role: "Designer", image: "Hemanth.jpg", github: "https://github.com/hemanthsudhan27-ship-it", linkedin: "https://www.linkedin.com/in/hemanth-sudhan-b1b92537b", instagram: "https://www.instagram.com/hemanth.sudhan" },
    { name: "Muhammad Shabaz", role: "Media", image: "Shabaz.jpg", github: "https://github.com/shabzeee", linkedin: "https://www.linkedin.com/in/muhammad-shabaz-936377379", instagram: "https://www.instagram.com/shabzeee" },
    { name: "Srevan S", role: "Media", image: "Srevan.jpg", github: "https://github.com/srevanhh-irl", linkedin: "https://www.linkedin.com/in/srevan-s-781a4639b/", instagram: "https://instagram.com/srevanhh" },
    { name: "Karthik C R", role: "Media", image: "Karthik.jpg", github: "https://github.com/karthikshibin4-web", linkedin: "https://www.linkedin.com/in/karthik-c-9b22a2393/", instagram: "https://instagram.com/kar.thiii._" },
];

const eventPosterMap: Record<string, string> = {
    'data_event.jpg': 'Data Analytics Workshop',
    'hackday-cev-2026.jpg': 'HackDay2026',
    'hallow_event.jpg': 'HALLOWS OF HACKING',
    'ai&her_event.jpg': 'AI & HER',
    'codefwd_event.jpg': 'code FORWARD: AI . Developer . Productivity',
    'fosscorner_event.jpg': 'FOSS CORNER - Evolvia',
    'linux_event.jpg': 'Linux Installation Party',
    'firewall_event.jpg': 'The Human Firewall: Your First and Last Line of Defense',
    'sit&git_event.jpg': 'Sit & Git',
    'intro_event.jpg': 'Introducing FOSS - Open Doors to Open Source',
};

const eventPhotoMap: Record<string, string[]> = {
    'HackDay2026': ['Hackday_1.jpeg', 'hackday_2.jpeg', 'hackday_3.jpeg'],
    'Linux Installation Party': ['Linuxinstall.jpeg'],
    'Sit & Git': ['Sit&git_1.jpeg', 'Sit&git_2.jpeg'],
};

const events = [
    { title: "Data Analytics Workshop", date: "2026-02-10", time: "9:00 AM - 4:00 PM", location: "Seminar Hall, ECE Department, College of Engineering Vadakara", description: "Join us for a comprehensive hands-on Data Analytics Workshop organized by Quasso Liberum XII, FOSS Club CEV, and CSI SB CEV in collaboration with TransEduverse. This workshop will cover data handling, visualization, insights, and real-world analytical techniques. Part of the Quasso Liberum 12th Edition inter-college techno-cultural fest.", type: "Workshop", attendees: "60+", status: "Upcoming", link: "https://fossunited.org/c/college-of-engineering-vadakara/data-analytics-workshop" },
    { title: "HackDay2026", date: "2026-01-20", time: "Full Day Event", location: "Mini Auditorium, College Of Engineering Vadakara", description: "In collaboration with Major League Hacking (MLH), the FOSS Club CEV is organizing an exciting hackathon on 20 January 2026. This event brings together innovative minds to collaborate, build impactful solutions, and celebrate open-source technology in a competitive and creative environment.", type: "Hackathon", attendees: "100+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/hackday" },
    { title: "HALLOWS OF HACKING", date: "2026-01-11", time: "Online Event", location: "ONLINE", description: "An online hacking event focused on cybersecurity challenges and ethical hacking practices. Join us to learn about security vulnerabilities and how to protect systems.", type: "Workshop", attendees: "150+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/hallowsofhacking" },
    { title: "AI & HER", date: "2025-12-20", time: "Virtual Session", location: "Virtual", description: "A special session focusing on women in AI and technology. Exploring the intersection of artificial intelligence and gender diversity in tech.", type: "Talk", attendees: "80+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/aiandher" },
    { title: "code FORWARD: AI . Developer . Productivity", date: "2025-11-02", time: "Online Session", location: "Google Meet", description: "Learn how AI tools are revolutionizing developer productivity. Discover the latest AI-powered development tools and techniques to enhance your coding workflow.", type: "Workshop", attendees: "120+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/code-forward" },
    { title: "FOSS CORNER - Evolvia", date: "2025-10-08", time: "2:00 PM - 5:00 PM", location: "D111, MCA Block", description: "An interactive session about the evolution of FOSS and its impact on modern software development. Featuring discussions on open-source contributions and community building.", type: "Meetup", attendees: "50+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/fosscorner-evolvia" },
    { title: "Linux Installation Party", date: "2025-10-06", time: "2:00 PM - 5:00 PM", location: "Tutorial Hall, College of Engineering Vadakara", description: "Bring your laptops! We will help you dual-boot Linux alongside Windows. Learn the basics of partitioning, drivers, and choosing the right distro for you.", type: "Workshop", attendees: "75+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/linux-party" },
    { title: "The Human Firewall: Your First and Last Line of Defense", date: "2025-09-28", time: "Online Session", location: "Jitsi Platform", description: "A cybersecurity awareness session focusing on human factors in security. Learn how to be the first line of defense against cyber threats.", type: "Talk", attendees: "100+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/cyber-awareness" },
    { title: "Sit & Git", date: "2025-09-19", time: "3:00 PM - 6:00 PM", location: "NOS LAB, College of Engineering Vadakara", description: "Stop emailing zip files! Learn version control, branching strategies, and how to make your first Pull Request. A hands-on Git workshop for beginners.", type: "Workshop", attendees: "60+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/Sit&Git" },
    { title: "Introducing FOSS - Open Doors to Open Source", date: "2025-09-11", time: "4:00 PM - 6:00 PM", location: "Mini Auditorium, College Of Engineering Vadakara", description: "The inaugural event of FOSS Club CEV! An introduction to Free and Open Source Software, its philosophy, and how you can get started with open-source contributions.", type: "Talk", attendees: "200+", status: "Completed", link: "https://fossunited.org/c/college-of-engineering-vadakara/IntroducingFOSS-OpenDoorstoOpenSource" },
];

// ── Step 3: Upload Team Photos ────────────────────────────────────

async function uploadTeamPhotos(): Promise<Record<string, string>> {
    console.log('\n📸 Step 3: Uploading team member photos...');
    const teamImageUrls: Record<string, string> = {};
    const allMembers = [...coreTeam, ...subTeam];

    for (const member of allMembers) {
        const localPath = path.join(PUBLIC_DIR, member.image);
        if (fs.existsSync(localPath)) {
            const url = await uploadImage('team-images', member.image, localPath);
            if (url) teamImageUrls[member.image] = url;
        } else {
            console.log(`  ⚠ Image not found: ${member.image}`);
        }
    }
    return teamImageUrls;
}

// ── Step 4: Upload Event Images ───────────────────────────────────

async function uploadEventImages(): Promise<{ posterUrls: Record<string, string>; photoUrls: Record<string, string[]> }> {
    console.log('\n🎪 Step 4: Uploading event poster images...');
    const posterUrls: Record<string, string> = {};
    const photoUrls: Record<string, string[]> = {};

    for (const [fileName, eventTitle] of Object.entries(eventPosterMap)) {
        const localPath = path.join(PUBLIC_DIR, fileName);
        if (fs.existsSync(localPath)) {
            const url = await uploadImage('event-posters', fileName, localPath);
            if (url) posterUrls[eventTitle] = url;
        } else {
            console.log(`  ⚠ Poster not found: ${fileName}`);
        }
    }

    console.log('\n📷 Uploading event gallery photos...');
    for (const [eventTitle, photos] of Object.entries(eventPhotoMap)) {
        photoUrls[eventTitle] = [];
        for (const fileName of photos) {
            const localPath = path.join(PUBLIC_DIR, fileName);
            if (fs.existsSync(localPath)) {
                const url = await uploadImage('event-photos', fileName, localPath);
                if (url) photoUrls[eventTitle].push(url);
            } else {
                console.log(`  ⚠ Photo not found: ${fileName}`);
            }
        }
    }

    return { posterUrls, photoUrls };
}

// ── Step 5: Insert Team Members ───────────────────────────────────

async function insertTeamMembers(teamImageUrls: Record<string, string>) {
    console.log('\n👥 Step 5: Inserting team members into database...');

    await sql`DELETE FROM team_members`;
    console.log('  ℹ Cleared existing team data');

    console.log('  Inserting core team...');
    for (let i = 0; i < coreTeam.length; i++) {
        const m = coreTeam[i];
        const imageUrl = teamImageUrls[m.image] || null;
        await sql`
            INSERT INTO team_members (name, role, image_url, github, linkedin, instagram, is_core_team, display_order)
            VALUES (${m.name}, ${m.role}, ${imageUrl}, ${m.github}, ${m.linkedin}, ${m.instagram}, ${true}, ${i + 1})
        `;
        console.log(`  ✅ ${m.name} (Core #${i + 1})`);
    }

    console.log('\n  Inserting sub team...');
    for (let i = 0; i < subTeam.length; i++) {
        const m = subTeam[i];
        const imageUrl = teamImageUrls[m.image] || null;
        await sql`
            INSERT INTO team_members (name, role, image_url, github, linkedin, instagram, is_core_team, display_order)
            VALUES (${m.name}, ${m.role}, ${imageUrl}, ${m.github}, ${m.linkedin}, ${m.instagram}, ${false}, ${i + 1})
        `;
        console.log(`  ✅ ${m.name} (Sub #${i + 1})`);
    }
}

// ── Step 6: Insert Events ─────────────────────────────────────────

async function insertEvents(posterUrls: Record<string, string>, photoUrls: Record<string, string[]>) {
    console.log('\n📅 Step 6: Inserting events into database...');

    await sql`DELETE FROM events`;
    console.log('  ℹ Cleared existing event data');

    for (const event of events) {
        const posterUrl = posterUrls[event.title] || null;
        const eventPhotos = photoUrls[event.title] || [];
        const imageUrl = posterUrl || (eventPhotos.length > 0 ? eventPhotos[0] : null);

        await sql`
            INSERT INTO events (title, date, time, location, description, type, attendees, status, image_url, poster_url, link)
            VALUES (${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.description}, ${event.type}, ${event.attendees}, ${event.status}, ${imageUrl}, ${posterUrl}, ${event.link})
        `;
        console.log(`  ✅ "${event.title}" ${posterUrl ? '(with poster)' : ''}`);
    }
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 FOSS CEV - Supabase Setup & Migration');
    console.log('━'.repeat(55));
    console.log(`📍 Database: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);
    console.log(`📍 Supabase: ${supabaseUrl}`);
    console.log(`📁 Public Dir: ${PUBLIC_DIR}`);

    try {
        console.log('\n🔌 Testing database connection...');
        const [{ now }] = await sql`SELECT NOW()`;
        console.log(`  ✅ Connected! Server time: ${now}`);

        await createTables();
        await createBuckets();
        const teamImageUrls = await uploadTeamPhotos();
        const { posterUrls, photoUrls } = await uploadEventImages();
        await insertTeamMembers(teamImageUrls);
        await insertEvents(posterUrls, photoUrls);

        console.log('\n🔍 Verifying...');
        const [{ team_count }] = await sql`SELECT COUNT(*) as team_count FROM team_members`;
        const [{ event_count }] = await sql`SELECT COUNT(*) as event_count FROM events`;
        console.log(`  👥 Team members in DB: ${team_count}`);
        console.log(`  📅 Events in DB: ${event_count}`);

        console.log('\n' + '━'.repeat(55));
        console.log('✅ Migration complete!');
        console.log(`  👥 ${coreTeam.length + subTeam.length} team members`);
        console.log(`  📅 ${events.length} events`);
        console.log(`  🖼️  ${Object.keys(teamImageUrls).length} team photos`);
        console.log(`  🎪 ${Object.keys(posterUrls).length} event posters`);
        console.log(`  📷 ${Object.values(photoUrls).flat().length} event photos`);
        console.log('\n🌐 Your website now loads data from Supabase!');

    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        if (error.message?.includes('password') || error.message?.includes('authentication')) {
            console.error('\n💡 Check DATABASE_URL password in .env.local');
        }
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();
