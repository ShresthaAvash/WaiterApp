import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Update this URL to include your project folder and the /public directory
const API_BASE_URL = 'http://192.168.1.76/restaurant/public/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add the JWT token to requests
apiClient.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('waiterToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default apiClient;