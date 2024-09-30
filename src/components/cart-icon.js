import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CartIcon = () => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity style={{ marginRight: 20 }} onPress={()=>navigation.navigate('CartScreen')}>
      <Icon name="cart-outline" size={24} color="red" />
      {/* Add logic to show item count */}
      <Text>67</Text>
    </TouchableOpacity>
  );
};

export default CartIcon;
