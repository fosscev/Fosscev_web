import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
    throw new Error(
        'Missing DATABASE_URL environment variable. Please check your .env.local file.'
    );
}

const sql = postgres(connectionString);

export default sql;
