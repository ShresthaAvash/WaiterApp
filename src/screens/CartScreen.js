import React, {useContext, useState, useMemo} from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import {CartContext} from '../context/CartContext';
import CartItem from '../components/CartItem';
import {submitOrder} from '../api/orders';

const CartScreen = ({navigation}) => {
  const {activeCart, clearCart, updateQuantity, removeItem} = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  // This is the key part: We get items AND tableId from the activeCart
  const {items, tableId} = activeCart;

  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0),
  [items]);

  const handleOrderSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to the cart before submitting.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        // Ensure tableId is correctly passed from the context
        tableId: tableId, 
        items: items.map(item => ({id: item.id, qty: item.qty})),
        source: 'waiter',
      };
      await submitOrder(orderData);
      Alert.alert('Success', 'Order submitted successfully!');
      clearCart();
      navigation.navigate('Table'); // Go back to table selection
    } catch (error) {
      // Improved error logging
      const errorMessage = error.response?.data?.message || 'Failed to submit order. Please try again.';
      Alert.alert('Error', errorMessage);
      console.log('Submit Order Error:', JSON.stringify(error.response?.data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
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
          contentContainerStyle={styles.list}
        />
      )}
      <View style={styles.summaryContainer}>
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalText}>${total.toFixed(2)}</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{marginTop: 10}}/>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, items.length === 0 && styles.disabledButton]}
            onPress={handleOrderSubmit}
            disabled={items.length === 0 || loading}>
            <Text style={styles.submitButtonText}>Submit Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    padding: 10,
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
      fontSize: 20,
      color: '#6c757d',
      fontWeight: '500'
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529'
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
  },
  submitButton: {
      backgroundColor: '#007BFF',
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
  },
  submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  disabledButton: {
      backgroundColor: '#a0c7e4',
  }
});

export default CartScreen;