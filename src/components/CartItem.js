import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (increment) => {
    const newQuantity = item.qty + increment;
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    } else {
      onRemoveItem(item.id); // Remove if quantity becomes 0
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.item_name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(-1)}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.qty}</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(1)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalPrice}>${(item.price * item.qty).toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  totalContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeButtonText: {
    fontSize: 24,
    color: '#d9534f',
    fontWeight: 'bold',
  },
});

export default CartItem;