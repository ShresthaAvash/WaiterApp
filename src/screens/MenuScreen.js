import React, {useState, useEffect, useContext, useMemo, useRef} from 'react';
import { View, Text, SectionList, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import {fetchMenu} from '../api/restaurant';
import {OrderContext} from '../context/OrderContext';
import {AuthContext} from '../context/AuthContext';
import MenuItem from '../components/MenuItem';
import NotesModal from '../components/NotesModal';
import {COLORS, FONTS, SIZES} from '../theme';

const MenuScreen = ({route, navigation}) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const sectionListRef = useRef(null);

  const {addItemToOrder, activeOrder} = useContext(OrderContext);
  const { waiter } = useContext(AuthContext);

  const { tableWaiterId, tableName, isCustomerOccupied } = route.params;

  const isTableLockedByWaiter = tableWaiterId && tableWaiterId !== waiter.id;
  const isTableLocked = isTableLockedByWaiter || isCustomerOccupied;

  const lockMessage = useMemo(() => {
    if (isTableLockedByWaiter) {
      return 'This table is being served by another waiter.';
    }
    if (isCustomerOccupied) {
      return 'This table is being used by a customer.';
    }
    return '';
  }, [isTableLockedByWaiter, isCustomerOccupied]);

  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchMenu();
        const formattedMenu = data.map(category => ({
            title: category.category_name,
            data: category.item,
        }));
        setMenu(formattedMenu);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch menu items.');
      } finally {
        setLoading(false);
      }
    };
    getMenu();
  }, []);

  const newItemsCount = useMemo(() => {
    if (!activeOrder || !activeOrder.newItems) {
        return 0;
    }
    return activeOrder.newItems.reduce((sum, item) => sum + item.qty, 0);
  }, [JSON.stringify(activeOrder.newItems)]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: tableName,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderSummary')}
          style={[styles.cartButton, isTableLocked && styles.disabledButton]}
          disabled={isTableLocked}
        >
          <Text style={styles.cartButtonText}>Order ({newItemsCount})</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, newItemsCount, isTableLocked, tableName]);

  const handleAddWithNotes = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmNote = (quantity, note) => {
    if (selectedItem) {
      addItemToOrder(selectedItem, quantity, note);
    }
    setSelectedItem(null);
  };
  
  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) {
      return menu;
    }
    const allItems = menu.flatMap(section => section.data);
    const filteredItems = allItems.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [{ title: 'Search Results', data: filteredItems }];
  }, [searchQuery, menu]);

  const itemQuantities = useMemo(() => {
      const quantities = {};
      if (activeOrder?.newItems) {
          activeOrder.newItems.forEach(cartItem => {
              quantities[cartItem.id] = (quantities[cartItem.id] || 0) + cartItem.qty;
          });
      }
      return quantities;
  }, [JSON.stringify(activeOrder.newItems)]);

  const scrollToCategory = (index) => {
    setActiveCategory(menu[index].title);
    sectionListRef.current.scrollToLocation({
        sectionIndex: index,
        itemIndex: 0,
        viewOffset: 10,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isTableLocked && (
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedBannerText}>{lockMessage}</Text>
        </View>
      )}
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a food item..."
        placeholderTextColor={COLORS.gray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {!searchQuery.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            <TouchableOpacity
                style={[styles.categoryButton, activeCategory === 'all' && styles.categoryButtonActive]}
                onPress={() => {
                    setActiveCategory('all');
                    sectionListRef.current.scrollToLocation({ sectionIndex: 0, itemIndex: 0 });
                }}>
                <Text style={[styles.categoryText, activeCategory === 'all' && styles.categoryTextActive]}>All</Text>
            </TouchableOpacity>
            {menu.map((category, index) => (
                <TouchableOpacity
                    key={category.title}
                    style={[styles.categoryButton, activeCategory === category.title && styles.categoryButtonActive]}
                    onPress={() => scrollToCategory(index)}>
                    <Text style={[styles.categoryText, activeCategory === category.title && styles.categoryTextActive]}>{category.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      )}

      <SectionList
        ref={sectionListRef}
        sections={filteredMenu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <MenuItem
            item={item}
            quantity={itemQuantities[item.id] || 0}
            onAdd={() => addItemToOrder(item, 1, '')}
            onAddWithNotes={() => handleAddWithNotes(item)}
            disabled={isTableLocked}
          />
        )}
        renderSectionHeader={({section: {title}}) => (
            !searchQuery.trim() ? <Text style={styles.sectionHeader}>{title}</Text> : null
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No menu items found.</Text>
          </View>
        }
      />
      {selectedItem && (
        <NotesModal
          visible={modalVisible}
          item={selectedItem}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmNote}
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
    backgroundColor: COLORS.lightGray,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding / 2,
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: COLORS.white,
    ...FONTS.body3,
  },
  cartButton: {
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  cartButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  lockedBanner: {
    backgroundColor: COLORS.danger,
    padding: 10,
    alignItems: 'center',
  },
  lockedBannerText: {
    color: COLORS.white,
    ...FONTS.body4,
    fontWeight: 'bold',
  },
  categoryContainer: {
      paddingHorizontal: 10,
      paddingBottom: 10,
  },
  categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 10,
      backgroundColor: COLORS.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.gray,
  },
  categoryButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primaryDark,
  },
  categoryText: {
    ...FONTS.body4,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  sectionHeader: {
    ...FONTS.h2,
    color: COLORS.secondary,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.lightGray,
  }
});

export default MenuScreen;