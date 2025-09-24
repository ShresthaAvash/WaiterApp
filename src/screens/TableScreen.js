import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { fetchTables, clearTableStatus } from '../api/restaurant';
import { OrderContext } from '../context/OrderContext';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, FONTS } from '../theme';

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemMargin = 10;
const itemSize = (width - itemMargin * 4) / numColumns;

const TableScreen = ({ navigation }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setTable, clearTableOrders, hasUnsentItems } = useContext(OrderContext);
  const { logout, waiter } = useContext(AuthContext);
  const isFocused = useIsFocused();
  const previousTablesRef = useRef([]);

  const getTables = useCallback(async () => {
    if (!waiter) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchTables();
      
      if (Array.isArray(data)) {
        setTables(data);

        const previousTables = previousTablesRef.current;
        const readyTables = [];

        if (previousTables.length > 0) {
            data.forEach(newTable => {
                const oldTable = previousTables.find(t => t.id === newTable.id);
                if (
                    oldTable &&
                    newTable.waiter_id === waiter.id &&
                    oldTable.status === 'preparing' &&
                    newTable.status === 'served'
                ) {
                    readyTables.push(newTable.table_name);
                }
            });
        }

        if (readyTables.length > 0) {
          Alert.alert(
            'Food Ready!',
            `Orders are ready for pickup at: ${readyTables.join(', ')}`
          );
        }

        previousTablesRef.current = data;
      } else {
        setTables([]);
        console.error("API did not return an array for tables. Response:", data);
        Alert.alert("Error", "Could not load table data. Please try again.");
      }

    } catch (error) {
      console.error("Failed to fetch tables:", error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [waiter]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  useEffect(() => {
    let interval;
    if (isFocused) {
      setLoading(true);
      getTables();
      interval = setInterval(getTables, 7000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused, getTables]);

  const handleClearTable = (table) => {
    const hasPending = hasUnsentItems(table.id);
    const isMyTable = waiter && table.waiter_id === waiter.id;

    if (hasPending) {
        Alert.alert(
            'Discard Unsent Items',
            `You have unsent items for ${table.table_name}. Do you want to discard them? This will not affect items already sent to the kitchen.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        clearTableOrders(table.id); 
                        getTables();
                    },
                },
            ],
        );
        return;
    }

    if (table.status === 'occupied') {
        Alert.alert(
            'Free Up Table',
            `Is ${table.table_name} empty? This action marks the table as available and is for correcting mistaken scans.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Free Up',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearTableStatus(table.id);
                            getTables();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to free up the table.');
                        }
                    },
                },
            ],
        );
        return;
    }

    if (isMyTable && ['served', 'bill_paid'].includes(table.status)) {
        Alert.alert(
            'Clear Table',
            `Are you sure you want to clear your table "${table.table_name}"? This will mark it as available.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            await clearTableStatus(table.id);
                            getTables();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear the table.');
                        }
                    },
                },
            ],
        );
        return;
    }

    if (table.status !== 'available') {
        let message = `This table has active kitchen orders (${table.status}) and cannot be cleared right now.`;
        if (!isMyTable && table.waiter_name) {
            message = `This table is assigned to ${table.waiter_name}. Only they can perform actions on it at this stage.`;
        }
        Alert.alert('Action Not Allowed', message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'OK', onPress: () => logout()},
    ]);
  };

  const handleSelectTable = table => {
    setTable(table.id);
    navigation.navigate('Menu', { 
        tableWaiterId: table.waiter_id, 
        tableName: table.table_name,
        isCustomerOccupied: !!table.table_token
    });
  };

  const { myTables, otherTables } = useMemo(() => {
    if (!waiter || !Array.isArray(tables)) return { myTables: [], otherTables: [] };

    const my = [];
    const others = [];

    tables.forEach(table => {
      if (table.waiter_id === waiter.id || hasUnsentItems(table.id)) {
        my.push(table);
      } else {
        others.push(table);
      }
    });

    return { myTables: my, otherTables: others };
  }, [tables, waiter, hasUnsentItems]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getStatusStyles = (status, hasPending) => {
    const effectiveStatus = hasPending ? 'occupied' : status;
    switch (effectiveStatus) {
      case 'ordered':
        return { container: styles.tableButtonOrdered, text: styles.tableTextActive, statusText: 'Ordered' };
      case 'preparing':
        return { container: styles.tableButtonPreparing, text: styles.tableTextActive, statusText: 'Preparing' };
      case 'served':
        return { container: styles.tableButtonServed, text: styles.tableTextActive, statusText: 'Served' };
      case 'occupied':
        return { container: styles.tableButtonActive, text: styles.tableTextActive, statusText: 'Occupied' };
      default:
        return { container: {}, text: {}, statusText: 'Available' };
    }
  };

  const renderTable = ({ item }) => {
    const hasPending = hasUnsentItems(item.id);
    const statusStyles = getStatusStyles(item.status, hasPending);
    const isMyTable = waiter && item.waiter_id === waiter.id;

    const startTime = item.start_time ? new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    const tableToken = item.table_token;

    return (
      <TouchableOpacity
        style={[styles.tableButton, statusStyles.container]}
        onPress={() => handleSelectTable(item)}
        onLongPress={() => handleClearTable(item)}>
        
        {isMyTable && <View style={styles.myTableIndicator} />}
        
        <Text style={[styles.tableText, statusStyles.text]}>{item.table_name}</Text>
        
        {tableToken && item.status !== 'available' && <Text style={[styles.tokenText, statusStyles.text]}>Token: {tableToken}</Text>}
        
        {startTime && <Text style={[styles.timeText, statusStyles.text]}>{startTime}</Text>}
        
        {item.waiter_name && <Text style={[styles.waiterText, statusStyles.text]}>{item.waiter_name}</Text>}
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{statusStyles.statusText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.scrollViewContainer}>
      {myTables.length > 0 && (
        <View>
          <Text style={styles.sectionHeader}>My Tables</Text>
          <FlatList
            data={myTables}
            renderItem={renderTable}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
      {otherTables.length > 0 && (
        <View>
          <Text style={styles.sectionHeader}>Other Tables</Text>
          <FlatList
            data={otherTables}
            renderItem={renderTable}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
      {tables.length === 0 && !loading && (
          <View style={styles.centered}>
              <Text>No tables found.</Text>
          </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingTop: 50,
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  listContainer: {
    paddingHorizontal: itemMargin / 2,
  },
  sectionHeader: {
    ...FONTS.h2,
    color: COLORS.secondary,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tableButton: {
    width: itemSize,
    height: itemSize + 20,
    margin: itemMargin / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingBottom: 25,
  },
  myTableIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: COLORS.danger,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tableText: {
    ...FONTS.h3,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  tableTextActive: {
    color: COLORS.white,
  },
  tokenText: {
    ...FONTS.body4,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#6c757d',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  waiterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 4,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    borderBottomLeftRadius: SIZES.radius * 2 - 2,
    borderBottomRightRadius: SIZES.radius * 2 - 2,
  },
  statusBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableButtonActive: { backgroundColor: COLORS.warning, borderColor: '#d39e00' },
  tableButtonOrdered: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  tableButtonPreparing: { backgroundColor: '#e67e22', borderColor: '#d35400' },
  tableButtonServed: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  logoutButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
  
export default TableScreen;