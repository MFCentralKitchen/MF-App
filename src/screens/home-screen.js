import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { firestore } from '../firebase-config'; // Use your Firestore config
import Icon from 'react-native-vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setCartData } from '../features/cart-slice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const {user} = useSelector(state => state.user)

  // Load cart data from Firestore
  const loadCartData = async () => {
    const userId = user.id; // Replace with actual user ID

    try {
      const userCartRef = firestore().collection('userCart').doc(userId);
      const cartDoc = await userCartRef.get();

      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        console.log('Cart data from Firestore:', cartData);
        dispatch(setCartData(cartData));
      } else {
        console.log('No cart data found for the user.');
      }
    } catch (error) {
      console.error('Failed to load cart data from Firestore:', error);
    }
  };

  // Fetch categories from Firestore
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
        alert('No categories found.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories. Please try again.');
    }
  };

  useEffect(() => {
    loadCartData();
    fetchCategories();
  }, []);

  // Render category item
  const renderCategory = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => navigation.navigate('CategoryItemsScreen', { categoryId: item.id })}
      >
        {/* Image rendering */}
        <Image
          source={{ uri: item.image }} // Ensure `item.image` contains a valid HTTP URL from Firestore
          style={styles.categoryImage}
          resizeMode="contain"
        />
        {/* Category Text */}
        <Text style={styles.categoryText}>{item.category}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        numColumns={3}
      />
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
    // padding: 10,
    backgroundColor: '#FFF8E1', // Mustard yellow color
    borderRadius: 10,
    alignItems: 'center',
    // justifyContent: 'center',
    elevation: 3, // For a subtle shadow effect
  },
  categoryImage: {
    width: '100%',
    height: 75, // Adjust height according to the image size
    marginBottom: 10,
    borderRadius:100
  },
  categoryText: {
    color: 'black', // Red color for text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
