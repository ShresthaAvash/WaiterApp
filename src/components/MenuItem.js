import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const MenuItem = ({item, onAdd, onCustomAdd}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.item_name}</Text>
        {item.item_description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.item_description}
          </Text>
        )}
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.customButton} onPress={onCustomAdd}>
          <Text style={styles.customButtonText}>Custom</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonText: {
    color: '#333',
    fontWeight: '500',
  },
});

export default MenuItem;