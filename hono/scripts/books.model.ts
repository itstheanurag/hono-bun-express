import { pool } from "../src/middlewares/db";

async function init() {
  try {
    // Ensure uuid-ossp extension is enabled (needed for gen_random_uuid or uuid_generate_v4)
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       title VARCHAR(255) NOT NULL,
       author VARCHAR(255) NOT NULL,
       published_year INTEGER,
       total_sales INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Table "books" created successfully with UUID.');
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await pool.end();
  }
}

init();
