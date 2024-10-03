import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../features/user-slice';
import { firestore } from '../firebase-config';
import logo from '../assets/MF-CPU-LOGO.png'; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // For toggling password visibility
  const [loading, setLoading] = useState(true); // State for loading indicator during initial check
  const [loginLoading, setLoginLoading] = useState(false); // State for loading indicator on login button
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if the user is already logged in
    const checkLoginStatus = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        dispatch(login(JSON.parse(userData)));
        navigation.navigate('MainTabNavigator');
      } else {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true); // Show loading indicator on login button
    try {
      const usersRef = firestore().collection('users');
      const querySnapshot = await usersRef
        .where('email', '==', email)
        .where('password', '==', password)
        .get();

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        dispatch(login(userData));
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        navigation.navigate('MainTabNavigator');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoginLoading(false); // Hide loading indicator once login is done
    }
  };

  const renderLoginForm = () => (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <Text style={styles.catchyText}>Welcome back! Let's get you logged in.</Text>

      {/* Email input */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#333"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      {/* Password input with show/hide functionality */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#333"
          style={[styles.input, { flex: 1 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible} // Toggle visibility
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Text style={styles.showHideText}>
            {passwordVisible ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login button with loading spinner */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loginLoading} // Disable button while loading
      >
        {loginLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
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
    // justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: "80%", 
    height: '40%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFEB99',
    padding: 10,
    // marginBottom: 10,
    borderRadius: 20,
    color: '#333',
    backgroundColor: '#FFEB99',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEB99',
    // padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#FFEB99',
    marginTop:10
  },
  showHideText: {
    color: 'red', // Theme color for show/hide text
    fontWeight: 'bold',
    marginRight:10
  },
  button: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  catchyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B8000', // Theme color
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default LoginScreen;
