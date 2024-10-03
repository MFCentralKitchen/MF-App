import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileIcon = () => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity onPress={()=>navigation.navigate('ProfileScreen')} style={{ marginLeft: 20 }}>
      <Icon name="person-outline" size={24} color="red" height={25}/>
      {/* Add navigation logic to profile screen */}<Text>hjgh</Text>
    </TouchableOpacity>
  );
};

export default ProfileIcon;
