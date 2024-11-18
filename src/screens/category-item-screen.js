import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {firestore} from '../firebase-config';
import {useDispatch, useSelector} from 'react-redux';
import {addItemToCart, removeItemFromCart} from '../features/cart-slice';
import Toast from '../components/toast'; // Import the Toast component

const CategoryItemsScreen = ({route}) => {
  const {categoryId} = route.params;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const {user} = useSelector(state => state.user)
  const {reduxItems} = useSelector(state => state.cart); // Redux cart state
  const dispatch = useDispatch();
  const userId = user.id; // Replace with the actual user ID from authentication
  const [toastVisible, setToastVisible] = useState(false); // Toast visibility state
  const [toastMessage, setToastMessage] = useState(''); // Toast message state

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsCollection = firestore().collection('inventoryItems');
        const querySnapshot = await itemsCollection
          .where('categoryId', '==', categoryId)
          .get();

        if (!querySnapshot.empty) {
          const itemList = querySnapshot.docs.map(doc => ({
            refId: doc.id, // This is the Firestore document ID
            ...doc.data(), // Include the rest of the item data
          }));
          setItems(itemList);
        } else {
          alert('No items found for this category');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        alert('Failed to fetch items. Please try again.');
      }
    };

    fetchItems();
  }, [categoryId]);

  // Update Firestore cart whenever the cart changes
  const updateFirestoreCart = async (updatedCart) => {
    try {
      const userCartRef = firestore().collection('userCart').doc(userId);
      await userCartRef.set(updatedCart);
      console.log('Cart updated in Firestore');
    } catch (error) {
      console.error('Error updating Firestore cart:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle item quantity change (increase or decrease)
  const handleQuantityChange = async (item, action) => {
    const currentQuantity = reduxItems[item.id]?.quantity || 0; // Current quantity from Redux cart
    const availableQuantity = item.availableQuantity; // Available quantity from item data
    const soldQuantity = item.soldQuantity || 0; // Sold quantity from item data
  
    let newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;
  
    // Prevent invalid quantities
    if (newQuantity > availableQuantity) {
      Alert.alert('Exceeded Quantity', 'You cannot add more than available quantity.');
      return;
    } else if (newQuantity < 0) {
      newQuantity = 0;
    }
  
    try {
      // Calculate updated quantities
      const updatedAvailableQuantity = availableQuantity - (newQuantity - currentQuantity);
      const updatedSoldQuantity = soldQuantity + (newQuantity - currentQuantity);
  
      // Update Firestore DB for inventory
      await firestore().collection('inventoryItems').doc(item.refId).update({
        availableQuantity: updatedAvailableQuantity,
        soldQuantity: updatedSoldQuantity,
      });
  
      // Update local state for UI
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === item.id
            ? { ...i, availableQuantity: updatedAvailableQuantity, soldQuantity: updatedSoldQuantity }
            : i
        ),
      );
  
      // Update Redux cart
      if (newQuantity === 0) {
        dispatch(removeItemFromCart(item.id));
      } else {
        dispatch(addItemToCart({ ...item, quantity: newQuantity, availableQuantity: updatedAvailableQuantity }));
      }
  
      // Sync cart with Firestore
      const updatedCart = {
        ...reduxItems,
        [item.id]: {
          ...item,
          quantity: newQuantity,
          availableQuantity: updatedAvailableQuantity,
          soldQuantity: updatedSoldQuantity,
        },
      };
      updateFirestoreCart(updatedCart);
  
      // Show toast message for first-time addition
      if (newQuantity === 1 && action === 'increase') {
        setToastMessage('Item added successfully to the cart!');
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
        }, 3000); // Hide toast after 3 seconds
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };
  

  // Render each item in the category
  const renderItem = ({item}) => {
    const cartItem = reduxItems[item.id] || {};  // Match item from Redux cart state
    const currentQuantity = cartItem.quantity || 0;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.itemSubText}>Brand: {item.brand}</Text>
          <Text style={styles.itemSubText}>Available: {item.availableQuantity}</Text>
          <Text style={styles.itemSubText}>Units: {item.units}</Text>
        </View>

        <View style={styles.quantityControls}>
          {currentQuantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleQuantityChange(item, 'increase')}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityWrapper}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, 'decrease')}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{currentQuantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, 'increase')}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search item..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.refId}
      />
      <Toast message={toastMessage} visible={toastVisible} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginVertical: 5,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDetails: {
    flex: 2,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  itemSubText: {
    fontSize: 14,
    color: 'gray',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: 'mustardyellow',
    padding: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    color: 'black',
    fontSize: 16,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: 'black',
  },
  addButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  searchBar: {
    marginBottom: 10,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default CategoryItemsScreen;
