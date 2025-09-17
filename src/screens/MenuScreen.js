import React, {useState, useEffect, useContext, useMemo, useRef} from 'react';
import { View, Text, SectionList, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import {fetchMenu} from '../api/restaurant';
import {OrderContext} from '../context/OrderContext';
import MenuItem from '../components/MenuItem';
import NotesModal from '../components/NotesModal';
import {COLORS, FONTS, SIZES} from '../theme';

const MenuScreen = ({navigation}) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const sectionListRef = useRef(null);

  const {addItemToOrder, activeOrder} = useContext(OrderContext);

  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchMenu();
        // The API now returns categories, each with an 'item' array
        // We rename 'category_name' to 'title' and 'item' to 'data' for the SectionList
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
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderSummary')}
          style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Order ({newItemsCount})</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, newItemsCount]);

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
    // If searching, flatten the list and filter
    const allItems = menu.flatMap(section => section.data);
    const filteredItems = allItems.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Return in a structure SectionList can use, but without category headers
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
        viewOffset: 10, // To offset from the top
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
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a food item..."
        placeholderTextColor={COLORS.gray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Category Filter Buttons */}
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
          />
        )}
        renderSectionHeader={({section: {title}}) => (
            // Only show headers if not searching
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