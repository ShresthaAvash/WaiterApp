import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext';
import {OrderProvider} from './src/context/OrderContext'; // <-- IMPORT OrderProvider
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <AuthProvider>
      <OrderProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </OrderProvider>
    </AuthProvider>
  );
};

export default App;