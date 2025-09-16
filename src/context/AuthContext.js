import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginWaiter} from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [waiter, setWaiter] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('waiterToken');
        if (storedToken) {
          setToken(storedToken);
          // You could also fetch waiter data here to verify the token
        }
      } catch (e) {
        console.error("Failed to load token from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginWaiter(email, password);
      if (data.access_token) {
        setToken(data.access_token);
        setWaiter(data.waiter); // Assuming API returns waiter details
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