// scripts/fix-user-passwords.js
const bcrypt = require('bcrypt');
const { User } = require('../src/models');

async function fixUserPasswords() {
  try {
    console.log(' Starting password fix...\n');

    // Define users with their passwords
    const usersToFix = [
      { username: 'admin', password: 'test123' },
      { username: 'creator1', password: 'test123' },
      { username: 'user1', password: 'test123' },
      { username: 'user2', password: 'test123' },
      { username: 'user3', password: 'test123' },
      { username: 'user4', password: 'test123' },
      { username: 'user5', password: 'test123' }
    ];

    console.log(` Fixing passwords for ${usersToFix.length} users...\n`);

    for (const userData of usersToFix) {
      // Find user
      const user = await User.findOne({ 
        where: { username: userData.username } 
      });

      if (!user) {
        console.log(`  User not found: ${userData.username}`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Update user password
      await user.update({ password: hashedPassword });

      console.log(` Fixed password for: ${userData.username} (${user.role})`);
    }

    console.log('\n Password fix completed successfully!');
    console.log('\n Test credentials:');
    console.log('   Username: admin');
    console.log('   Password: test123');
    console.log('\n   Username: creator1');
    console.log('   Password: test123');

  } catch (error) {
    console.error(' Error fixing passwords:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixUserPasswords();
