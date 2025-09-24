import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthContext} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import TableScreen from '../screens/TableScreen';
import MenuScreen from '../screens/MenuScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {token, isLoading} = useContext(AuthContext);

  // We only need to check the authentication loading state here.
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {token ? (
        <>
          <Stack.Screen name="Table" component={TableScreen} options={{title: 'Select a Table'}} />
          <Stack.Screen name="Menu" component={MenuScreen} options={{title: 'Menu'}} />
          <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{title: 'Order Summary'}} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;