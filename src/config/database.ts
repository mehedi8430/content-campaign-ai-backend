import { Pool } from 'pg';
import logger from './logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initSchema = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await initSchema();
    client.release();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

export { pool };
export default connectDB;
