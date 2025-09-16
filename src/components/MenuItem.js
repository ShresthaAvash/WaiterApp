import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const MenuItem = ({item, onAddToCart}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.item_name}</Text>
        <Text style={styles.description}>{item.item_description}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.actionContainer}>
        <Button title="Add to Cart" onPress={onAddToCart} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MenuItem;