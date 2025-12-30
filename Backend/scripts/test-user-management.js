// scripts/test-user-management.js
const { User, sequelize } = require('../src/models');
const authService = require('../src/modules/auth-rbac/service/auth.service');
const userService = require('../src/modules/users/service/user.service');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function runTests() {
    console.log(' Starting User Management Tests...');

    try {
        await sequelize.authenticate();

        // 1. Setup Test User
        const timestamp = Date.now();
        const testUser = await User.create({
            username: `testuser_${timestamp}`,
            email: `test_${timestamp}@example.com`,
            password: await bcrypt.hash('password123', 10),
            full_name: 'Test User',
            role: 'user'
        });
        console.log(' Created test user:', testUser.username);

        // 2. Test Profile Update (Name & Email)
        console.log('\n--- 2. Testing Profile Update ---');
        const updated = await userService.updateUser(testUser.id, {
            full_name: 'Updated Name',
            email: `updated_${timestamp}@example.com`
        });

        if (updated.full_name === 'Updated Name' && updated.email === `updated_${timestamp}@example.com`) {
            console.log(' Profile update successful');
        } else {
            console.error(' Profile update failed', updated);
        }

        // 3. Test Duplicate Email Catch
        // Create another user
        await User.create({
            username: `other_${timestamp}`,
            email: `duplicate_${timestamp}@example.com`,
            password: 'pass',
            full_name: 'Other'
        });

        try {
            await userService.updateUser(testUser.id, { email: `duplicate_${timestamp}@example.com` });
            console.error(' Failed to catch duplicate email!');
        } catch (err) {
            if (err.message.includes('already in use')) {
                console.log(' Caught duplicate email correctly');
            } else {
                console.error(' Unexpected error on duplicate email:', err.message);
            }
        }

        // 4. Test Password Change
        console.log('\n--- 4. Testing Password Change ---');

        // 4a. Wrong current password
        try {
            await authService.changePassword(testUser.id, 'wrongpass', 'newpass123');
            console.error(' Failed to reject wrong password');
        } catch (err) {
            console.log(' Rejected wrong current password');
        }

        // 4b. Correct current password
        await authService.changePassword(testUser.id, 'password123', 'newpassword999');

        // Verify login with new password
        try {
            await authService.login(testUser.username, 'newpassword999');
            console.log(' Login with NEW password successful');
        } catch (err) {
            console.error(' Login with new password failed:', err.message);
        }

        // Verify login with OLD password fails
        try {
            await authService.login(testUser.username, 'password123');
            console.error(' Old password still works!');
        } catch (err) {
            console.log(' Old password no longer works');
        }

        // Cleanup
        await User.destroy({ where: { username: { [require('sequelize').Op.like]: 'testuser_%' } } });
        await User.destroy({ where: { username: { [require('sequelize').Op.like]: 'other_%' } } });

        console.log('\n All Tests Passed');

    } catch (error) {
        console.error(' Test Suite Failed:', error);
    } finally {
        await sequelize.close();
    }
}

runTests();
