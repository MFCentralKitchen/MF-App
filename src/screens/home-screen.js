// home-screen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { firestore } from '../firebase-config';
import Icon from 'react-native-vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCartData } from '../features/cart-slice';
import { useDispatch } from 'react-redux';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);

  const loadCartData = async () => {
    const userId = 'some-user-id'; // Replace with the actual user ID from authentication
  
    try {
      // Fetch the cart from Firestore
      const userCartRef = firestore().collection('userCart').doc(userId);
      const cartDoc = await userCartRef.get();
  
      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        console.log('Cart data from Firestore:', cartData);
  
        // Dispatch action to set the cart data in Redux store
        // Assuming the cartData is structured in a way compatible with Redux
        dispatch(setCartData(cartData)); 
      } else {
        console.log('No cart data found for the user in Firestore.');
      }
    } catch (error) {
      console.error('Failed to load cart data from Firestore:', error);
    }
  };
  

  useEffect(() => {
    loadCartData();
    const fetchCategories = async () => {
      try {
        const catRef = firestore().collection('inventoryCategory');
        const querySnapshot = await catRef.get();

        if (!querySnapshot.empty) {
          const categoriesArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesArray);
        } else {
          alert('No categories found');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to fetch categories. Please try again.');
      }
    };

    fetchCategories();
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryItemsScreen', { categoryId: item.id })}
    >
      <Text style={styles.categoryText}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        numColumns={3}
      />
      <Icon name={'person'} size={20} color={'black'} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    padding: 20,
    backgroundColor: '#f29d35', // Mustard yellow color
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: 'red', // Red color for text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
