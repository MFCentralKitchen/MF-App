import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { user } = useSelector(state => state.user); // Get logged-in user details from Redux
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            // Clear Redux state
            dispatch({ type: 'CLEAR_USER' });

            // Clear AsyncStorage (local storage)
            await AsyncStorage.removeItem('user');

            // Navigate to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], // Assuming 'Login' is the name of the login screen
            });
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>

      <View style={styles.profileDetails}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Restaurant:</Text>
        <Text style={styles.value}>{user.restaurantName}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phone}</Text>

        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{user.address}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    // justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F', // Red theme color
    textAlign: 'center',
    marginBottom: 30,
  },
  profileDetails: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F', // Red text color
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    backgroundColor: '#FFF8E1', // Mustard yellow background
    padding: 10,
    borderRadius: 5,
  },
  logoutButton: {
    backgroundColor: '#D32F2F', // Red theme color
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileScreen;
