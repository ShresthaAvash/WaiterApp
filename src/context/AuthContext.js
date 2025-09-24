import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginWaiter, getWaiterProfile} from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [waiter, setWaiter] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function runs once when the app starts
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await AsyncStorage.getItem('waiterToken');
        if (userToken) {
          // If a token is found, validate it by fetching the user profile
          setToken(userToken);
          const profile = await getWaiterProfile();
          setWaiter(profile);
        }
      } catch (e) {
        // This means the token was invalid or the API failed.
        console.error('Restoring token failed, signing out.', e);
        await AsyncStorage.removeItem('waiterToken');
        setToken(null);
        setWaiter(null);
      }
      // Signal that the initial loading is complete
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginWaiter(email, password);
      if (data.access_token) {
        setToken(data.access_token);
        setWaiter(data.waiter);
        await AsyncStorage.setItem('waiterToken', data.access_token);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setToken(null);
    setWaiter(null);
    await AsyncStorage.removeItem('waiterToken');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{waiter, token, isLoading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};