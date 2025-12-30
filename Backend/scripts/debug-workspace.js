const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Workspace } = require('../src/models');

// Mock IO
app.set('io', { emit: () => console.log('Mock IO emit') });

async function run() {
    try {
        console.log('Connecting DB...');
        await sequelize.authenticate();
        console.log('DB connected');

        // 1. Register Creator
        const uniqueId = Date.now();
        const creatorUser = {
            username: `creator_${uniqueId}`,
            email: `creator_${uniqueId}@example.com`,
            password: 'Password123!',
            full_name: 'Test Creator',
            role: 'creator' // Requesting creator role
        };

        console.log('Registering creator...');
        let res = await request(app).post('/api/modules/auth/register').send(creatorUser);

        if (res.status !== 201) {
            console.log('Register Failed:', res.status, JSON.stringify(res.body));
            return;
        }

        const token = res.body.data.token;
        const userId = res.body.data.user.id;
        console.log('Registered. Token:', token.substring(0, 20) + '...');

        // 2. Create Workspace
        console.log('Creating workspace...');
        res = await request(app)
            .post('/api/modules/workspaces')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Debug Workspace',
                description: 'Debug Description'
            });

        console.log('Create Workspace Status:', res.status);
        console.log('Body:', JSON.stringify(res.body, null, 2));

        // Cleanup
        if (res.body.workspace && res.body.workspace.id) {
            await Workspace.destroy({ where: { id: res.body.workspace.id } });
        }
        await User.destroy({ where: { id: userId } });

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await sequelize.close();
    }
}
run();
