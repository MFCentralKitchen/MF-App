// main-tab-navigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // For Icons
import HomeScreen from './home-screen';
import OrderHistoryScreen from './order-history-screen';
import ProfileIcon from '../components/profile-icon';
import CartIcon from '../components/cart-icon';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Order History') {
            iconName = 'receipt-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerLeft: () => <ProfileIcon />,
          headerRight: () => <CartIcon  />,
        }}
      />
      <Tab.Screen
        name="Order History"
        component={OrderHistoryScreen}
        options={{ headerTitleAlign: 'center' ,headerShown : false}}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
