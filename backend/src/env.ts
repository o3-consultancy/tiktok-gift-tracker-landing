// Load environment variables BEFORE anything else
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Validate critical environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not found in environment variables');
}

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  WARNING: MONGODB_URI not found in environment variables');
}

export {};
