/**
 * Script to make a user an admin
 * Usage: tsx src/scripts/make-admin.ts <email>
 */

import '../env.js';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

async function makeAdmin(email: string) {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    console.log(`Looking for user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\nTip: Check the exact email in your database');
      process.exit(1);
    }

    console.log(`\n📋 User found:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Firebase UID: ${user.firebaseUid}`);
    console.log(`   Current role: ${user.role || 'undefined'}`);
    console.log(`   Display name: ${user.displayName || 'Not set'}`);

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log(`\n✅ Successfully updated ${email} to admin role`);
    console.log(`\n🔐 The user can now access the admin panel at admin.o3-ttgifts.com`);
    console.log(`\n⚠️  Important: User must log out and log back in for changes to take effect`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: tsx src/scripts/make-admin.ts <email>');
  console.error('Example: tsx src/scripts/make-admin.ts admin@o3-ttgifts.com');
  process.exit(1);
}

makeAdmin(email);
