import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {fetchTables} from '../api/restaurant';
import {OrderContext} from '../context/OrderContext';
import {AuthContext} from '../context/AuthContext';
import {COLORS, SIZES, FONTS} from '../theme';

const {width} = Dimensions.get('window');
const itemSize = width / 3 - 20;

const TableScreen = ({navigation}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const {setTable} = useContext(OrderContext);
  const {logout} = useContext(AuthContext);
  const isFocused = useIsFocused();

  const getTables = async () => {
    try {
      const data = await fetchTables();
      setTables(data);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      // --- THIS IS THE FIX ---
      // Ensure loading is always set to false after the fetch attempt.
      setLoading(false);
      // --- END OF FIX ---
    }
  };
  
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
      setLoading(true); // Set loading true only on initial focus
      getTables();

      interval = setInterval(() => {
        // Subsequent polls will not show the main loader
        getTables();
      }, 7000);
    }
    
    // Cleanup interval when the screen loses focus
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isFocused]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'OK', onPress: () => logout()},
    ]);
  };

  const handleSelectTable = tableId => {
    setTable(tableId);
    navigation.navigate('Menu');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getStatusStyles = status => {
    switch (status) {
      case 'ordered':
        return {
          container: styles.tableButtonOrdered,
          text: styles.tableTextActive,
          statusText: 'Ordered',
        };
      case 'served':
        return {
          container: styles.tableButtonServed,
          text: styles.tableTextActive,
          statusText: 'Served',
        };
      case 'occupied':
        return {
          container: styles.tableButtonActive,
          text: styles.tableTextActive,
          statusText: 'Occupied',
        };
      default:
        return {
          container: {},
          text: {},
          statusText: 'Available',
        };
    }
  };

  return (
    <FlatList
      data={tables}
      keyExtractor={item => item.id.toString()}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({item}) => {
        const statusStyles = getStatusStyles(item.status);
        return (
          <TouchableOpacity
            style={[styles.tableButton, statusStyles.container]}
            onPress={() => handleSelectTable(item.id)}>
            <Text style={[styles.tableText, statusStyles.text]}>
              {item.table_name}
            </Text>
            <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{statusStyles.statusText}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};


const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  container: {
    padding: 10,
    backgroundColor: COLORS.lightGray,
  },
  tableButton: {
    width: itemSize,
    height: itemSize + 20,
    margin: 10,
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
    paddingBottom: 30,
  },
  tableButtonActive: {
    backgroundColor: COLORS.warning,
    borderColor: '#d39e00',
  },
  tableButtonOrdered: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  tableButtonServed: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  tableText: {
    ...FONTS.h3,
    color: COLORS.secondary,
  },
  tableTextActive: {
    color: COLORS.white,
  },
  statusBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.2)',
      paddingVertical: 6,
      borderBottomLeftRadius: SIZES.radius * 2 -2,
      borderBottomRightRadius: SIZES.radius * 2 -2,
  },
  statusBadgeText: {
      ...FONTS.body4,
      fontSize: 12,
      color: COLORS.white,
      textAlign: 'center',
      fontWeight: 'bold',
  },
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