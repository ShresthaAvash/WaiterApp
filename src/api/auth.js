import apiClient from './apiClient';

export const loginWaiter = async (email, password) => {
  try {
    const response = await apiClient.post('/waiter/login', {
      email, // Changed from 'username' to 'email'
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};