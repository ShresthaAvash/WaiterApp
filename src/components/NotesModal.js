import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../theme';

const NotesModal = ({visible, item, onClose, onConfirm}) => {
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1); // Add quantity state

  useEffect(() => {
    if (visible) {
      setNote('');
      setQuantity(1); // Reset quantity when modal opens
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(quantity, note); // Pass both quantity and note
    onClose();
  };

  const handleQuantityChange = (amount) => {
      setQuantity(prev => Math.max(1, prev + amount)); // Ensure quantity is at least 1
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{item?.item_name}</Text>

          {/* Quantity Selector */}
          <Text style={styles.modalText}>Quantity:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(-1)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalText}>Add preparation notes (optional):</Text>
          <TextInput
            style={styles.input}
            onChangeText={setNote}
            value={note}
            placeholder="e.g., less salt, no peanuts"
            placeholderTextColor={COLORS.gray}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm]}
              onPress={handleConfirm}>
              <Text style={styles.textStyle}>Add to Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.secondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    ...FONTS.body3,
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.secondary,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.secondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  quantityText: {
    ...FONTS.h2,
    marginHorizontal: 20,
    color: COLORS.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: COLORS.gray,
  },
  buttonConfirm: {
    backgroundColor: COLORS.primary,
  },
  textStyle: {
    ...FONTS.h4,
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default NotesModal;