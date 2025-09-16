import React, {useContext, useState} from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import {CartContext} from '../context/CartContext';
import CartItem from '../components/CartItem';
import {submitOrder} from '../api/orders';

const CartScreen = ({navigation}) => {
  const {items, tableId, clearCart, updateQuantity, removeItem} = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOrderSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to the cart before submitting.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        tableId: tableId,
        items: items.map(item => ({id: item.id, qty: item.qty})),
        source: 'waiter',
      };
      await submitOrder(orderData);
      Alert.alert('Success', 'Order submitted successfully!');
      clearCart();
      navigation.navigate('Table'); // Go back to table selection
    } catch (error) {
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <CartItem
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          )}
        />
      )}
      <View style={styles.summaryContainer}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <Button
            title="Submit Order"
            onPress={handleOrderSubmit}
            disabled={items.length === 0}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#888',
  },
});

export default CartScreen;