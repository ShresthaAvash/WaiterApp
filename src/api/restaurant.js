import apiClient from './apiClient';

export const fetchTables = async () => {
  try {
    const response = await apiClient.get('/tables');
    return response.data;
  } catch (error) {
    console.error('Fetch tables API error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchMenu = async () => {
  try {
    const response = await apiClient.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Fetch menu API error:', error.response?.data || error.message);
    throw error;
  }
};