const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const testEndpoints = async () => {
  try {
    console.log('Testing signup endpoint...');
    const signupResponse = await axios.post(`${BASE_URL}/signup`, {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    });
    console.log('✓ Signup successful:', signupResponse.data);

    console.log('\nTesting login endpoint...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    console.log('✓ Login successful:', loginResponse.data);

    const token = loginResponse.data.token;
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log('\nTesting session endpoint...');
    const sessionResponse = await axios.get(`${BASE_URL}/session`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✓ Session retrieved:', sessionResponse.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testEndpoints();