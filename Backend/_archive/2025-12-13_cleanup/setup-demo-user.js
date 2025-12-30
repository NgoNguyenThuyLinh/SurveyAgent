// setup-demo-user.js
// Set environment variables first
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3307';
process.env.DB_USER = 'llm_survey_user';
process.env.DB_PASSWORD = 'password123';
process.env.DB_NAME = 'llm_survey_db';

const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function setupDemoUser() {
  console.log(' Setting up demo admin user...');

  try {
    // Check if admin exists
    let admin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (admin) {
      console.log(' Admin user already exists');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true
      });
      
      console.log(' Admin user created successfully');
    }

    // Create regular user for testing
    let user = await User.findOne({ where: { email: 'user@example.com' } });
    
    if (user) {
      console.log(' Regular user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('user123', 10);
      
      user = await User.create({
        username: 'testuser',
        email: 'user@example.com',
        password: hashedPassword,
        full_name: 'Test User',
        role: 'user',
        is_active: true
      });
      
      console.log(' Regular user created successfully');
    }

    console.log('\n Demo accounts:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    
  } catch (error) {
    console.error(' Error setting up demo user:', error.message);
  }
}

setupDemoUser().then(() => {
  console.log('\n Setup completed!');
  process.exit(0);
}).catch(error => {
  console.error('\n Setup failed:', error);
  process.exit(1);
});