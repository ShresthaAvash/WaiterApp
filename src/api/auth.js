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

// --- ADD THIS NEW FUNCTION ---
export const getWaiterProfile = async () => {
    try {
        const response = await apiClient.get('/user');
        return response.data;
    } catch (error) {
        console.error('Get waiter profile API error:', error.response?.data || error.message);
        throw error;
    }
};