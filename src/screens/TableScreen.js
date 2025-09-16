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
import {fetchTables} from '../api/restaurant';
import {CartContext} from '../context/CartContext';
import {AuthContext} from '../context/AuthContext'; // Import AuthContext

const {width} = Dimensions.get('window');
const itemSize = width / 3 - 20;

const TableScreen = ({navigation}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const {setTable, carts} = useContext(CartContext);
  const {logout} = useContext(AuthContext); // Get logout function

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => logout() }
    ]);
  };

  useEffect(() => {
    const getTables = async () => {
      try {
        const data = await fetchTables();
        setTables(data);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch tables.');
      } finally {
        setLoading(false);
      }
    };
    getTables();
  }, []);

  const handleSelectTable = tableId => {
    setTable(tableId);
    navigation.navigate('Menu');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <FlatList
      data={tables}
      keyExtractor={item => item.id.toString()}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({item}) => {
        const cartForTable = carts[item.id];
        const hasItems = cartForTable && cartForTable.items.length > 0;
        return (
          <TouchableOpacity
            style={[styles.tableButton, hasItems && styles.tableButtonActive]}
            onPress={() => handleSelectTable(item.id)}>
            <Text
              style={[
                styles.tableText,
                hasItems && styles.tableTextActive,
              ]}>
              {item.table_name}
            </Text>
            {hasItems && <View style={styles.activeDot} />}
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  tableButton: {
    width: itemSize,
    height: itemSize,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  tableButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#3a75b5',
  },
  tableText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  tableTextActive: {
    color: '#ffffff',
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  logoutButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: '#d9534f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TableScreen;