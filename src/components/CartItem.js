import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const CartItem = ({item, onUpdateQuantity, onRemoveItem}) => {
  const handleQuantityChange = text => {
    const quantity = parseInt(text, 10);
    if (!isNaN(quantity)) {
      onUpdateQuantity(item.id, quantity);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.item_name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TextInput
          style={styles.quantityInput}
          value={item.qty.toString()}
          onChangeText={handleQuantityChange}
          keyboardType="number-pad"
        />
      </View>
      <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  removeButton: {
    marginLeft: 15,
    padding: 8,
  },
  removeButtonText: {
    color: 'red',
  },
});

export default CartItem;