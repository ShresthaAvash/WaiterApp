import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, isEditable = false }) => {
  const handleQuantityChange = (increment) => {
    if (!isEditable) return; // Only allow changes if editable
    const newQuantity = item.qty + increment;
    onUpdateQuantity(item.id, newQuantity, item.remarks); // Pass remarks to find correct item
  };

  const handleRemove = () => {
    if (!isEditable) return;
    onRemoveItem(item.id, item.remarks); // Pass remarks to find correct item
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.item_name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)} each</Text>
        {item.remarks ? (
          <Text style={styles.remarks}>Note: {item.remarks}</Text>
        ) : null}
      </View>

      {isEditable ? (
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(-1)}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.qty}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleQuantityChange(1)}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>x {item.qty}</Text>
        </View>
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalPrice}>${(item.price * item.qty).toFixed(2)}</Text>
      </View>
      
      {isEditable && (
        <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      )}
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
      remarks: {
        fontSize: 12,
        color: '#555',
        fontStyle: 'italic',
        marginTop: 4,
      },
      quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        minWidth: 80,
        justifyContent: 'center'
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
        color: COLORS.secondary,
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