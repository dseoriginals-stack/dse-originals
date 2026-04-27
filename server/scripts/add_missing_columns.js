import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");
    
    const queries = [
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "storyHtml" TEXT;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isBestseller" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPopular" BOOLEAN DEFAULT false;`
    ];

    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await client.query(q);
    }

    console.log("✅ Columns added successfully");
  } catch (err) {
    console.error("❌ Failed to add columns:", err.message);
  } finally {
    await client.end();
  }
}

run();
