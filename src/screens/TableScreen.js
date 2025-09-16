import React, {useState, useEffect, useContext} from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {fetchTables} from '../api/restaurant';
import {CartContext} from '../context/CartContext';

const TableScreen = ({navigation}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const {setTable} = useContext(CartContext);

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
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={tables}
      keyExtractor={item => item.id.toString()}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.tableButton}
          onPress={() => handleSelectTable(item.id)}>
          <Text style={styles.tableText}>{item.table_name}</Text>
        </TouchableOpacity>
      )}
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
  tableButton: {
    flex: 1,
    margin: 10,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TableScreen;