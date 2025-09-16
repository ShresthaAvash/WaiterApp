import React, {useState} from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const QuantityModal = ({visible, item, onClose, onConfirm}) => {
  const [quantity, setQuantity] = useState('1');

  const handleConfirm = () => {
    const num = parseInt(quantity, 10);
    if (!isNaN(num) && num > 0) {
      onConfirm(num);
      setQuantity('1'); // Reset for next time
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{item?.item_name}</Text>
          <Text style={styles.modalText}>Enter quantity:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setQuantity}
            value={quantity}
            keyboardType="number-pad"
            autoFocus={true}
            selectTextOnFocus={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={handleConfirm}>
              <Text style={styles.textStyle}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: '#f194ff',
  },
  buttonConfirm: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QuantityModal;