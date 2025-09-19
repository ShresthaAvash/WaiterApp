import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginWaiter, getWaiterProfile} from '../api/auth'; // Import getWaiterProfile

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [waiter, setWaiter] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and fetch user profile on app start
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('waiterToken');
        if (storedToken) {
          // Set token first so API calls are authenticated
          setToken(storedToken);
          // Fetch waiter data using the token
          const profile = await getWaiterProfile();
          setWaiter(profile);
        }
      } catch (e) {
        console.error("Failed to load token/profile.", e);
        // If fetching the profile fails, the token is likely invalid, so clear it.
        await AsyncStorage.removeItem('waiterToken');
        setToken(null);
        setWaiter(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginWaiter(email, password);
      if (data.access_token) {
        setToken(data.access_token);
        setWaiter(data.waiter); // API returns waiter details on login
        await AsyncStorage.setItem('waiterToken', data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      return false;
    }
  };

  const logout = async () => {
    setToken(null);
    setWaiter(null);
    await AsyncStorage.removeItem('waiterToken');
  };

  return (
    <AuthContext.Provider value={{waiter, token, isLoading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};