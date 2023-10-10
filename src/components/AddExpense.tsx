import React, {useState} from 'react';
import {
  View,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const categories = [
  'Food',
  'Gift',
  'Petrol',
  'Drink',
  'Snacks',
  'Shopping',
  'Mechanic',
  'Mobile',
  'Bills',
  'Car',
  'Others',
];
const MyModal = ({isVisible, onClose, handleSave}) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const handleClear = () => {
    setInput1('');
    setInput2('');
    setSelectedCat('');
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <StatusBar backgroundColor={'#0008'} animated />
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: 20,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'black',
                flex: 1,
                marginLeft: 30,
              }}>
              Add Expense
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" color={'black'} size={20} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="How much did you spend?"
            placeholderTextColor="#888888"
            value={input1}
            keyboardType="numeric"
            onChangeText={text => setInput1(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Where did you spend?"
            placeholderTextColor="#888888"
            value={input2}
            onChangeText={text => setInput2(text)}
          />
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                onPress={() => setSelectedCat(category)}
                activeOpacity={0.7}
                key={index}
                style={[
                  styles.categoryTile,
                  category === selectedCat ? {backgroundColor: 'grey'} : {},
                ]}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Save"
            onPress={() => {
              Promise.resolve()
                .then(handleSave?.bind(this, input1, input2, selectedCat))
                .then(handleClear);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0008',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black', // Text color is black
  },
  closeButton: {
    // position: 'absolute',
    // top: -10, // Move the close button up
    // right: 10,
    // padding: 10,
    marginLeft: 'auto',
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // Close button text color is black
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // alignContent: 'center',
    justifyContent: 'center',
  },
  categoryTile: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    color: 'black',
  },
});

export default MyModal;
