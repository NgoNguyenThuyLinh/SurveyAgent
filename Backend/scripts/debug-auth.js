const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

async function run() {
    try {
        console.log('Connecting DB...');
        await sequelize.authenticate();
        console.log('DB connected');

        const uniqueId = Date.now();
        const payload = {
            username: `debug_${uniqueId}`,
            email: `debug_${uniqueId}@test.com`,
            password: 'Password123!',
            full_name: 'Debug User',
            role: 'user'
        };
        console.log('Sending payload:', payload);

        const res = await request(app).post('/api/modules/auth/register').send(payload);

        console.log('Status:', res.status);
        console.log('Body:', JSON.stringify(res.body, null, 2));

        // Cleanup
        if (res.status === 201 && res.body.data && res.body.data.id) {
            console.log('Cleaning up user', res.body.data.id);
            const { User } = require('../src/models');
            await User.destroy({ where: { id: res.body.data.id } });
        }

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await sequelize.close();
    }
}
run();
