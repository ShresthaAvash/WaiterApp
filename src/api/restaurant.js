import apiClient from './apiClient';

// In WaiterApp/src/api/restaurant.js
export const fetchTables = async () => {
  try {
    // Point to the new, smarter endpoint
    const response = await apiClient.get('/tables-status');
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

// --- ADD THIS NEW FUNCTION ---
export const clearTableStatus = async (tableId) => {
try {
const response = await apiClient.post(`/tables/${tableId}/clear`);
return response.data;
} catch (error) {
console.error('Clear table API error:', error.response?.data || error.message);
throw error;
}


};
