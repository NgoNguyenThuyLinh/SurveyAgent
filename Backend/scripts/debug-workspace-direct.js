require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Workspace } = require('../src/models');
const jwt = require('jsonwebtoken');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');

        const uniqueId = Date.now();

        // 1. Direct Create User
        const user = await User.create({
            username: 'debug_direct_' + uniqueId,
            email: `debug_direct_${uniqueId}@example.com`,
            password: 'hash',
            full_name: 'Direct Debug',
            role: 'creator'
        });
        console.log('User created:', user.id, user.role);

        // 2. Gen Token
        // Ensure we use the SAME secret as the application.
        // If .env is loaded, process.env.JWT_SECRET should be set.
        console.log('Using Secret:', process.env.JWT_SECRET ? 'YES' : 'NO');

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'llm_survey_secret_2024',
            { expiresIn: '1h' }
        );
        // console.log('Token:', token);

        // 3. Create Workspace
        const res = await request(app)
            .post('/api/modules/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Direct Debug WS',
                description: 'Direct Description'
            });

        console.log('Status:', res.status);
        console.log('Body:', JSON.stringify(res.body, null, 2));

        // Cleanup
        if (res.body.workspace && res.body.workspace.id) {
            await Workspace.destroy({ where: { id: res.body.workspace.id } });
        }
        await User.destroy({ where: { id: user.id } });

    } catch (e) { console.error('ERROR:', e); }
    finally { await sequelize.close(); }
}
run();
