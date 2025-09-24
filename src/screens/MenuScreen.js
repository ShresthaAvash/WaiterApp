import React, {useState, useEffect, useContext, useMemo, useRef} from 'react';
import { View, Text, SectionList, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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

  const {addItemToOrder, activeOrder, refreshPlacedItems} = useContext(OrderContext);
  const { waiter } = useContext(AuthContext);
  const isFocused = useIsFocused();

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
    // Refresh the list of items already sent to the kitchen when the screen comes into focus
    if (isFocused) {
      refreshPlacedItems();
    }
  }, [isFocused]);

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
  
  const totalItemsCount = useMemo(() => {
    if (!activeOrder) {
        return 0;
    }
    const newItemsCount = activeOrder.newItems?.reduce((sum, item) => sum + item.qty, 0) || 0;
    const placedItemsCount = activeOrder.placedItems?.filter(item => item.status !== 'cancelled').reduce((sum, item) => sum + item.qty, 0) || 0;
    
    return newItemsCount + placedItemsCount;
  }, [activeOrder.newItems, activeOrder.placedItems]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: tableName,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderSummary')}
          style={[styles.cartButton, isTableLocked && styles.disabledButton]}
          disabled={isTableLocked}
        >
          <Text style={styles.cartButtonText}>Order ({totalItemsCount})</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, totalItemsCount, isTableLocked, tableName]);

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
    let sectionsToRender = menu;

    if (activeCategory !== 'all') {
        sectionsToRender = menu.filter(section => section.title === activeCategory);
    }

    if (!searchQuery.trim()) {
        return sectionsToRender;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filteredSections = sectionsToRender.map(section => {
        const filteredData = section.data.filter(item => 
            item.item_name.toLowerCase().includes(lowercasedQuery)
        );
        return { ...section, data: filteredData };
    }).filter(section => section.data.length > 0);

    return filteredSections;

  }, [searchQuery, menu, activeCategory]);

  const itemQuantities = useMemo(() => {
      const quantities = {};
      if (activeOrder?.newItems) {
          activeOrder.newItems.forEach(cartItem => {
              quantities[cartItem.id] = (quantities[cartItem.id] || 0) + cartItem.qty;
          });
      }
      return quantities;
  }, [activeOrder.newItems]);

  const scrollToCategory = (title) => {
    setActiveCategory(title);
    const sectionIndex = menu.findIndex(section => section.title === title);
    if (sectionListRef.current && sectionIndex !== -1) {
        sectionListRef.current.scrollToLocation({
            sectionIndex: sectionIndex,
            itemIndex: 0,
            viewOffset: 10,
            animated: true,
        });
    }
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
      <View style={{height:60}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          <TouchableOpacity
              style={[styles.categoryButton, activeCategory === 'all' && styles.categoryButtonActive]}
              onPress={() => setActiveCategory('all')}>
              <Text style={[styles.categoryText, activeCategory === 'all' && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          {menu.map((category) => (
              <TouchableOpacity
                  key={category.title}
                  style={[styles.categoryButton, activeCategory === category.title && styles.categoryButtonActive]}
                  onPress={() => scrollToCategory(category.title)}>
                  <Text style={[styles.categoryText, activeCategory === category.title && styles.categoryTextActive]}>{category.title}</Text>
              </TouchableOpacity>
          ))}
      </ScrollView>
      </View>
      <SectionList
        ref={sectionListRef}
        sections={filteredMenu}
        keyExtractor={(item, index) => item.id.toString() + index}
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
            <Text style={styles.sectionHeader}>{title}</Text>
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
  // --- AESTHETIC CHANGES START HERE ---
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    paddingBottom: 15,
    maxHeight:60,
  },
  categoryButton: {
      paddingVertical: 4,      // Reduced vertical padding for less height
      paddingHorizontal: 14,   // Adjusted horizontal padding
      marginRight: 8,
      backgroundColor: COLORS.white,
      borderRadius: 16,        // Slightly reduced border radius
      borderWidth: 1,
      borderColor: '#e0e0e0',
      justifyContent: 'center', // Center text vertically
      alignItems: 'center',
      height:40,
      width:90,
  },
  categoryButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primaryDark,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.15,
      shadowRadius: 1.5,
  },
  categoryText: {
    fontSize: 16,             // Reduced font size for a smaller look
    color: COLORS.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  sectionHeader: {
    ...FONTS.h2,
    color: COLORS.secondary,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.lightGray,
  }
  // --- AESTHETIC CHANGES END HERE ---
});

export default MenuScreen;