import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { login } from '../features/user-slice';
import { firestore } from '../firebase-config';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true); // State for loading indicator
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if the user is already logged in
    const checkLoginStatus = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        // If user exists in local storage, log them in automatically
        dispatch(login(JSON.parse(userData)));
        navigation.navigate('MainTabNavigator');
      } else {
        setLoading(false); // Stop loading if no user is found
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      const usersRef = firestore().collection('users');
      const querySnapshot = await usersRef
        .where('email', '==', email)
        .where('password', '==', password)
        .get();

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        dispatch(login(userData));

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // Navigate to the home screen with bottom tab
        navigation.navigate('MainTabNavigator');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const renderLoginForm = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#fff"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#fff"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="red" /> 
    </View>
  ) : (
    renderLoginForm()
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFEB99', // Mustard yellow background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEB99',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'red', // Red color for the title
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: '#fff', // White text color for input
    backgroundColor: '#f29d35', // Slight darker mustard for input background
  },
  button: {
    backgroundColor: 'red', // Red background for the button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // White text color for button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
