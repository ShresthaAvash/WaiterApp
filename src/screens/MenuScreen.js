import React, {useState, useEffect, useContext, useMemo} from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import {fetchMenu} from '../api/restaurant';
import {CartContext} from '../context/CartContext';
import MenuItem from '../components/MenuItem';
import QuantityModal from '../components/QuantityModal'; // Import the modal

const MenuScreen = ({navigation}) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {addItem, activeCart} = useContext(CartContext);

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

  const cartItemCount = useMemo(() => {
    return activeCart.items.reduce((sum, item) => sum + item.qty, 0);
  }, [activeCart]);

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

  const handleCustomAdd = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmQuantity = quantity => {
    if (selectedItem) {
      addItem(selectedItem, quantity);
    }
    setModalVisible(false);
    setSelectedItem(null);
  };

  const filteredMenu = useMemo(() => {
    if (!searchQuery) {
      return menu;
    }
    return menu.filter(item =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, menu]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a food item..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <MenuItem
            item={item}
            onAdd={() => addItem(item, 1)}
            onCustomAdd={() => handleCustomAdd(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
      {selectedItem && (
        <QuantityModal
          visible={modalVisible}
          item={selectedItem}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmQuantity}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 10,
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  cartButton: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MenuScreen;