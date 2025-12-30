// create-basic-template.js
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/modules';

async function createBasicTemplate() {
  try {
    // 1. Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Create basic template
    const templateData = {
      title: 'Basic Survey Template',
      description: 'A basic template for testing',
      category: 'general',
      questions: [
        {
          question_text: 'How satisfied are you with our service?',
          question_type: 'multiple_choice',
          required: true,
          options: [
            { option_text: 'Very Satisfied' },
            { option_text: 'Satisfied' },
            { option_text: 'Neutral' },
            { option_text: 'Dissatisfied' },
            { option_text: 'Very Dissatisfied' }
          ]
        },
        {
          question_text: 'Please share any additional feedback:',
          question_type: 'text',
          required: false,
          options: []
        }
      ]
    };

    const createResponse = await axios.post(`${API_BASE_URL}/templates`, templateData, { headers });
    console.log(' Basic template created successfully!');
    console.log(`   Template ID: ${createResponse.data.data?.id || 'unknown'}`);
    console.log(`   Title: ${templateData.title}`);

    return createResponse.data.data;
  } catch (error) {
    console.error(' Error creating template:', error.response?.data || error.message);
    throw error;
  }
}

createBasicTemplate().then(() => {
  console.log('\n Template is ready for testing!');
}).catch(error => {
  console.error('\n Failed to create template:', error.message);
});