// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import LoginScreen from './src/screens/login-screen';
import MainTabNavigator from './src/screens/main-tab-navigator';
import { DarkThemeCustom, LightTheme } from './src/utils/theme';
import { useColorScheme } from 'react-native';
import CategoryItemsScreen from './src/screens/category-item-screen';
import CartScreen from './src/screens/cart-screen';
import CartLoader from './src/components/cart-loader';

const Stack = createStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  
  return (
    <Provider store={store}>
      {/* <CartLoader /> */}
      <NavigationContainer theme={scheme === 'dark' ? DarkThemeCustom : LightTheme}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="MainTabNavigator" 
            component={MainTabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="CategoryItemsScreen" 
            component={CategoryItemsScreen} 
          />
          <Stack.Screen 
            name="CartScreen" 
            component={CartScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
