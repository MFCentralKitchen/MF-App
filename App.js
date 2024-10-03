// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider} from 'react-redux';
import {store} from './src/store';
import LoginScreen from './src/screens/login-screen';
import MainTabNavigator from './src/screens/main-tab-navigator';
import {DarkThemeCustom, LightTheme} from './src/utils/theme';
import {useColorScheme} from 'react-native';
import CategoryItemsScreen from './src/screens/category-item-screen';
import CartScreen from './src/screens/cart-screen';
import CartLoader from './src/components/cart-loader';
import ProfileScreen from './src/screens/profile-screen';

const Stack = createStackNavigator();

export default function App() {
  const scheme = useColorScheme();

  return (
    <Provider store={store}>
      {/* <CartLoader /> */}
      <NavigationContainer
        theme={scheme === 'dark' ? DarkThemeCustom : LightTheme}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MainTabNavigator"
            component={MainTabNavigator}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CategoryItemsScreen"
            component={CategoryItemsScreen}
          />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              title: 'My Profile', // Set the text you want to display in the header
              headerStyle: {
                backgroundColor: '#FFFFFF', // White background for the header
              },
              headerTintColor: '#D32F2F', // Red text color for the header
              headerTitleStyle: {
                fontWeight: 'bold', // Optional: Bold text for the header title
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
