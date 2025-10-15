/**
 * Script to check user details including role
 * Usage: tsx src/scripts/check-user.ts <email>
 */

import '../env.js';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { TikTokAccount } from '../models/TikTokAccount.js';

async function checkUser(email: string) {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    console.log(`\nSearching for user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`\n❌ User not found: ${email}`);
      console.log('\nTip: Make sure the email matches exactly (case-insensitive)');
      process.exit(1);
    }

    console.log(`\n✅ User found!`);
    console.log(`\n📋 User Details:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Firebase UID: ${user.firebaseUid}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}`);
    console.log(`   Role: ${user.role || 'undefined (defaults to "user")'}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Last Login: ${user.lastLogin || 'Never'}`);

    // Check subscription
    const subscription = await Subscription.findOne({ userId: user._id });
    if (subscription) {
      console.log(`\n💳 Subscription:`);
      console.log(`   Plan: ${subscription.plan}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Deployment Fee Paid: ${subscription.deploymentFeePaid}`);
    } else {
      console.log(`\n💳 Subscription: None`);
    }

    // Check accounts
    const accountCount = await TikTokAccount.countDocuments({ userId: user._id });
    console.log(`\n📱 TikTok Accounts: ${accountCount}`);

    // Check if admin
    if (user.role === 'admin') {
      console.log(`\n✅ This user IS an admin`);
      console.log(`   Can access: admin.o3-ttgifts.com`);
    } else {
      console.log(`\n⚠️  This user is NOT an admin`);
      console.log(`   To make admin, run: tsx src/scripts/make-admin.ts ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: tsx src/scripts/check-user.ts <email>');
  console.error('Example: tsx src/scripts/check-user.ts admin@o3-ttgifts.com');
  process.exit(1);
}

checkUser(email);
