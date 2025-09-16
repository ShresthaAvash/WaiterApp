import apiClient from './apiClient';

export const submitOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Submit order API error:', error.response?.data || error.message);
    throw error;
  }
};