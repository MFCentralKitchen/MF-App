import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {firestore} from '../firebase-config'; 
import {addItemToCart, removeItemFromCart} from '../features/cart-slice';

const CartScreen = () => {
  const dispatch = useDispatch();
  const {reduxItems} = useSelector(state => state.cart); // Redux cart state
  const [cartItems, setCartItems] = useState([]);
  const userId = 'some-user-id'; // Replace this with actual user id (from auth)

  // Load cart from Firestore when the component mounts
  useEffect(() => {
    const loadCartFromFirestore = async () => {
      try {
        const userCartRef = firestore().collection('userCart').doc(userId);
        const docSnapshot = await userCartRef.get();
        if (docSnapshot.exists) {
          const cartData = docSnapshot.data();
          setCartItems(Object.values(cartData)); // Assuming cartData is stored as {itemId: {itemDetails}}
          dispatch({ type: 'SET_CART', payload: cartData }); // Initialize Redux cart from Firestore
        }
      } catch (error) {
        console.error('Error loading cart from Firestore:', error);
      }
    };

    loadCartFromFirestore();
  }, []);

  // Sync cart items from Redux to local state for rendering
  useEffect(() => {
    const cartArray = Object.values(reduxItems);
    setCartItems(cartArray);
  }, [reduxItems]);

  // Function to update Firestore whenever cart changes
  const updateFirestoreCart = async (updatedCart) => {
    try {
      const userCartRef = firestore().collection('userCart').doc(userId);
      await userCartRef.set(updatedCart);
      console.log('Cart updated in Firestore');
    } catch (error) {
      console.error('Error updating Firestore cart:', error);
    }
  };

  // Handle quantity change directly in the cart
  const handleQuantityChange = async (item, action) => {
    const currentQuantity = reduxItems[item.id]?.quantity || 0;
    const availableQuantity = item.availableQuantity;
    let newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity > availableQuantity) {
      Alert.alert('Exceeded Quantity', 'You cannot add more than available quantity.');
      return;
    } else if (newQuantity < 0) {
      newQuantity = 0;
    }

    try {
      const updatedAvailableQuantity = availableQuantity - (newQuantity - currentQuantity);
      
      await firestore().collection('inventoryItems').doc(item.refId).update({
        availableQuantity: updatedAvailableQuantity,
      });

      setCartItems(prevItems =>
        prevItems.map(i => (i.id === item.id ? {...i, availableQuantity: updatedAvailableQuantity} : i)),
      );

      if (newQuantity === 0) {
        dispatch(removeItemFromCart(item.id));
      } else {
        dispatch(addItemToCart({...item, quantity: newQuantity}));
      }

      const updatedCart = { ...reduxItems, [item.id]: { ...item, quantity: newQuantity }};
      updateFirestoreCart(updatedCart); // Update Firestore when cart changes

    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Remove item from cart
  const removeFromCart = async (item) => {
    const cartItemQuantity = reduxItems[item.id]?.quantity || 0; // Get the current quantity of the item in the cart

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          onPress: async () => {
            try {
              // 1. Remove the item from Redux state
              dispatch(removeItemFromCart(item.id));

              // 2. Update Firestore
              const updatedCart = { ...reduxItems };
              delete updatedCart[item.id];
              updateFirestoreCart(updatedCart);

              // 3. Update the local cart state in the UI
              setCartItems(prevItems => prevItems.filter(i => i.id !== item.id));

              // 4. Update Firestore inventory (increase available quantity)
              const updatedAvailableQuantity = item.availableQuantity + cartItemQuantity;
              await firestore().collection('inventoryItems').doc(item.refId).update({
                availableQuantity: updatedAvailableQuantity,
              });

              console.log(`Updated available quantity for ${item.title} to ${updatedAvailableQuantity}`);
            } catch (error) {
              console.error('Error removing item from cart:', error);
              alert('Failed to remove the item. Please try again.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Place order and update Firestore
  const placeOrder = async () => {
    try {
      const orderData = {
        items: cartItems,
        totalCost: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        createdAt: new Date(),
      };

      await firestore().collection('orders').add(orderData);

      Alert.alert('Order Success', 'Your order has been placed successfully.');
      dispatch({type: 'CLEAR_CART'}); // Clear Redux cart
      updateFirestoreCart({}); // Clear Firestore cart

      setCartItems([]); // Clear local cart state
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const renderItem = ({item}) => {
    const currentQuantity = reduxItems[item.id]?.quantity || 0;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.itemSubText}>Brand: {item.brand}</Text>
          <Text style={styles.itemSubText}>Quantity: {currentQuantity}</Text>
        </View>
        
        <View style={styles.quantityControls}>
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

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item)}>
          <Text style={styles.removeButtonText}>x</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={placeOrder}>
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          </TouchableOpacity>
        )}
      />
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
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
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
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubText: {
    fontSize: 14,
    color: 'gray',
  },
  quantityControls: {
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
    color: 'black',
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  placeOrderButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;
