import React, {useContext, useState, useMemo} from 'react';
import {
View,
Text,
SectionList,
StyleSheet,
Alert,
ActivityIndicator,
TouchableOpacity,
} from 'react-native';
import {OrderContext} from '../context/OrderContext';
import CartItem from '../components/CartItem';
import {submitOrder} from '../api/orders';
import {clearTableStatus} from '../api/restaurant';
import {COLORS, FONTS, SIZES} from '../theme';
const OrderSummaryScreen = ({navigation}) => {
const {activeOrder, activeTableId, sendOrderToKitchen, clearTableOrders} =
useContext(OrderContext);
const [loading, setLoading] = useState(false);
const [clearing, setClearing] = useState(false);
const {newItems = [], placedItems = []} = activeOrder || {};
const total = useMemo(
() => newItems.reduce((sum, item) => sum + item.price * item.qty, 0),
[newItems],
);
const handleOrderSubmit = async () => {
if (newItems.length === 0) {
Alert.alert('No New Items','There are no new items to send to the kitchen.');
return;
}
setLoading(true);
try {
await sendOrderToKitchen();
Alert.alert('Success', 'Order sent to kitchen!');
} catch (error) {
Alert.alert('Error', error.message || 'Failed to send order.');
} finally {
setLoading(false);
}
};
const handleClearAndExit = () => {
Alert.alert(
'Clear Table',
'Are you sure you want to clear all orders for this table? This action marks the table as available.',
[
{text: 'Cancel', style: 'cancel'},
{
text: 'Yes, Clear',
style: 'destructive',
onPress: async () => {
setClearing(true);
try {
// Call the API to update the status on the server
await clearTableStatus(activeTableId);

// Clear the local state in the app
          clearTableOrders();

          // --- THIS IS THE FIX ---
          // Navigate back to the table screen *after* operations are complete
          navigation.navigate('Table');
          // --- END OF FIX ---
          
        } catch (error) {
          Alert.alert('Error', 'Could not clear the table. Please try again.');
        } finally {
          // It's good practice to set loading to false even if navigation happens
          setClearing(false);
        }
      },
    },
  ],
);
};
const sections = [
{title: 'New Items (Not Sent)', data: newItems, isEditable: true},
{title: 'Sent to Kitchen', data: placedItems, isEditable: false},
].filter(section => section.data.length > 0);
return (
<View style={styles.container}>
{sections.length === 0 ? (
<View style={styles.emptyContainer}>
<Text style={styles.emptyText}>No items for this table yet.</Text>
</View>
) : (
<SectionList
sections={sections}
keyExtractor={(item, index) => item.id.toString() + index + item.remarks}
renderItem={({item, section}) => (
<CartItem
item={item}
isEditable={section.isEditable}
onUpdateQuantity={updateQuantity}
onRemoveItem={removeItem}
/>
)}
renderSectionHeader={({section: {title}}) => (
<Text style={styles.header}>{title}</Text>
)}
contentContainerStyle={styles.list}
/>
)}

<View style={styles.summaryContainer}>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>New Items Total:</Text>
      <Text style={styles.totalText}>${total.toFixed(2)}</Text>
    </View>
    {loading ? (
      <ActivityIndicator size="large" color="#fff" style={{marginTop: 10}} />
    ) : (
      <TouchableOpacity
        style={[
          styles.submitButton,
          newItems.length === 0 && styles.disabledButton,
        ]}
        onPress={handleOrderSubmit}
        disabled={newItems.length === 0 || loading}>
        <Text style={styles.submitButtonText}>Send New Items to Kitchen</Text>
      </TouchableOpacity>
    )}

    {clearing ? (
        <ActivityIndicator size="large" color={COLORS.danger} style={{marginTop: 10}}/>
    ) : (
        <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearAndExit}>
        <Text style={styles.clearButtonText}>Clear Table & Exit</Text>
        </TouchableOpacity>
    )}
  </View>
</View>
);
};
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#f8f9fa',
},
list: {
paddingHorizontal: 10,
},
header: {
fontSize: 18,
fontWeight: 'bold',
backgroundColor: '#e9ecef',
paddingVertical: 10,
paddingHorizontal: 15,
marginTop: 15,
marginBottom: 5,
borderRadius: 8,
color: '#495057',
overflow: 'hidden',
},
summaryContainer: {
borderTopWidth: 1,
borderTopColor: '#dee2e6',
padding: 20,
backgroundColor: '#ffffff',
borderTopLeftRadius: 20,
borderTopRightRadius: 20,
elevation: 5,
shadowColor: '#000',
shadowOffset: { width: 0, height: -3 },
shadowOpacity: 0.1,
shadowRadius: 3,
},
totalRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 15,
},
totalLabel: {
fontSize: 18,
color: '#6c757d',
fontWeight: '500'
},
totalText: {
fontSize: 22,
fontWeight: 'bold',
color: '#212529'
},
emptyContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
paddingTop: 50,
},
emptyText: {
fontSize: 18,
color: '#6c757d',
},
submitButton: {
backgroundColor: '#28a745',
paddingVertical: 15,
borderRadius: 12,
alignItems: 'center',
marginBottom: 10,
},
submitButtonText: {
color: '#fff',
fontSize: 18,
fontWeight: 'bold',
},
disabledButton: {
backgroundColor: '#a3d9b3',
},
clearButton: {
backgroundColor: '#dc3545',
paddingVertical: 12,
borderRadius: 12,
alignItems: 'center',
},
clearButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},
});
export default OrderSummaryScreen;