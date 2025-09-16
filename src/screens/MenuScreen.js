import React, {useState, useEffect, useContext} from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import {fetchMenu} from '../api/restaurant';
import {CartContext} from '../context/CartContext';
import MenuItem from '../components/MenuItem';

const MenuScreen = ({navigation}) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const {addItem, items: cartItems} = useContext(CartContext);

  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchMenu();
        setMenu(data);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch menu items.');
      } finally {
        setLoading(false);
      }
    };
    getMenu();
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Cart ({cartItemCount})</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, cartItemCount]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={menu}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <MenuItem item={item} onAddToCart={() => addItem(item)} />
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 10,
  },
  cartButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MenuScreen;