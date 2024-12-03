import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {firestore} from '../firebase-config'; 
import {addItemToCart, removeItemFromCart, setCartData} from '../features/cart-slice';
import Trash from '../assets/Trashcan.png'
import NetInfo from '@react-native-community/netinfo';

const CartScreen = () => {
  const dispatch = useDispatch();
  const {reduxItems} = useSelector(state => state.cart); // Redux cart state
  const {user} = useSelector(state => state.user)
  const [cartItems, setCartItems] = useState([]);
  const [placeOrderClicked,setPlaceOrderClicked] = useState(false)
  const userId = user.id; // Replace this with actual user id (from auth)
console.log(cartItems)
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
    const currentQuantity = reduxItems[item.id]?.quantity || 0; // Current quantity from Redux
    const availableQuantity = item.availableQuantity; // Available quantity
    const soldQuantity = item.soldQuantity || 0; // Sold quantity
  
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
  
      // Update Firestore DB
      await firestore().collection('inventoryItems').doc(item.refId).update({
        availableQuantity: updatedAvailableQuantity,
        soldQuantity: updatedSoldQuantity,
      });
  
      // Update local state for UI
      setCartItems(prevItems =>
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
    // Check for network connection
    setPlaceOrderClicked(true)
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setPlaceOrderClicked(false)
      Alert.alert('Error', 'No network connection. Please check your internet and try again.');
      return;
    }
  
    if (cartItems.length == 0) {
      setPlaceOrderClicked(false)
      Alert.alert('Error', 'Your cart is empty. Add items before placing an order.');
      return;
    }
  
    try {
      // Calculate the total price (quantity * price for each item)
      const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
      const invoiceData = {
        userId: user.id,
        createdAt: new Date().toISOString(),
        name: user.name,
        restaurantName: user.restaurantName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        items: cartItems.map(item => ({
          title: item.title,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          units: item.units
        })),
        orderStatus: 'pending', // Default order status
        deliveryCharges: 0, // Default to 0, modify if needed
        tax: 0, // Default to 0, modify if needed
        totalPrice: totalPrice, // Calculated total price
      };
  
      // Add the invoice data to the Firestore `invoices` collection
      await firestore().collection('invoices').add(invoiceData);
  
      // Show success message
      Alert.alert('Order Success', 'Your order has been placed successfully.');
  
      // Clear the cart in Redux and Firestore
      dispatch(setCartData({})); // Clear Redux cart
      updateFirestoreCart({}); // Clear Firestore cart if using sync
  
      setCartItems([]); // Clear local cart state if necessary
      setPlaceOrderClicked(false)
  
    } catch (error) {
      console.error('Error placing order:', error);
      setPlaceOrderClicked(false)
      Alert.alert('Error', 'Failed to place order. Please try again.');
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
          <Text style={styles.itemSubText}>Units: {item.units}</Text>
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
          {/* <Text style={styles.removeButtonText}>x</Text> */}
          <Image source={Trash} style={{width:25,height:25}} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem} // Passing the renderItem function
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>No item in the cart</Text>
          </View>
        )} // Handling empty cart scenario
        ListFooterComponent={() => (
          cartItems.length > 0 && ( // Only show Place Order button if there are items
            <TouchableOpacity
              style={[styles.placeOrderButton,{backgroundColor:placeOrderClicked ? '#E0E0E0' : 'green'}]}
              onPress={placeOrder}
              disabled={placeOrderClicked}>
                <View style={{flexDirection:'row'}}>
                {placeOrderClicked && <ActivityIndicator size={24} color={'black'} style={{marginRight:20}}/>}
                <Text style={[styles.placeOrderButtonText,{color:placeOrderClicked ? 'black' : 'white'}]}>Place Order</Text>
                </View>
            </TouchableOpacity>
          )
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
    backgroundColor: '#FFF8E1',
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
    // backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    alignSelf:'center'
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
    color: '#FFF8E1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: 'black',
  },
});

export default CartScreen;
