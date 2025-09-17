import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';
const MenuItem = ({ item, onAdd, onAddWithNotes, quantity }) => {
const isAdded = quantity > 0;
// Animation setup for the quantity badge
const scaleValue = useRef(new Animated.Value(isAdded ? 1 : 0)).current;
useEffect(() => {
Animated.timing(scaleValue, {
toValue: isAdded ? 1 : 0,
duration: 200,
useNativeDriver: true,
}).start();
}, [isAdded]);
const badgeStyle = {
transform: [{ scale: scaleValue }],
opacity: scaleValue.interpolate({
inputRange: [0, 1],
outputRange: [0, 1]
})
};
return (
<Animated.View style={[styles.container, isAdded && styles.containerAdded]}>
<View style={styles.infoContainer}>
<Text style={styles.name}>{item.item_name}</Text>
{item.item_description && (
<Text style={styles.description} numberOfLines={2}>
{item.item_description}
</Text>
)}
<Text style={styles.price}>${item.price.toFixed(2)}</Text>
</View>
<View style={styles.actionsContainer}>
<TouchableOpacity style={styles.notesButton} onPress={onAddWithNotes}>
<Text style={styles.notesButtonText}>Notes</Text>
</TouchableOpacity>

{/* --- THIS IS THE FIX --- */}
    {/* Quantity Badge is now separate and animates in */}
    <Animated.View style={[styles.quantityBadge, badgeStyle]}>
        <Text style={styles.quantityBadgeText}>{quantity}</Text>
    </Animated.View>

    {/* The Add button is always visible */}
    <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
    {/* --- END OF FIX --- */}

  </View>
</Animated.View>
);
};
const styles = StyleSheet.create({
container: {
flexDirection: 'row',
padding: SIZES.padding / 1.5,
marginBottom: SIZES.base * 1.5,
backgroundColor: COLORS.white,
borderRadius: SIZES.radius,
elevation: 3,
shadowColor: '#000',
shadowOffset: {width: 0, height: 1},
shadowOpacity: 0.1,
shadowRadius: 2,
borderLeftWidth: 5,
borderLeftColor: 'transparent',
},
containerAdded: {
borderLeftColor: COLORS.primary,
backgroundColor: '#f8ffed',
},
infoContainer: {
flex: 1,
paddingRight: 10,
},
name: {
...FONTS.h3,
color: COLORS.secondary,
},
description: {
...FONTS.body4,
color: COLORS.gray,
marginTop: 4,
},
price: {
...FONTS.h3,
color: COLORS.primary,
marginTop: 8,
},
actionsContainer: {
flexDirection: 'row',
alignItems: 'center',
},
addButton: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: COLORS.primary,
justifyContent: 'center',
alignItems: 'center',
elevation: 2,
},
addButtonText: {
color: COLORS.white,
fontSize: 24,
fontWeight: 'bold',
},
notesButton: {
paddingVertical: 10,
paddingHorizontal: 15,
backgroundColor: COLORS.lightGray,
borderRadius: 20,
borderWidth: 1,
borderColor: COLORS.gray,
justifyContent: 'center',
alignItems: 'center',
marginRight: 8,
},
notesButtonText: {
...FONTS.body4,
color: COLORS.secondary,
fontWeight: '500',
},
quantityBadge: {
width: 32,
height: 32,
borderRadius: 16,
backgroundColor: COLORS.primaryDark,
justifyContent: 'center',
alignItems: 'center',
marginRight: 8,
},
quantityBadgeText: {
color: COLORS.white,
fontSize: 16,
fontWeight: 'bold',
}
});
export default MenuItem;