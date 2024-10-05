// main-tab-navigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // For Icons
import HomeScreen from './home-screen';
import OrderHistoryScreen from './order-history-screen';
import ProfileIcon from '../components/profile-icon';
import CartIcon from '../components/cart-icon';
import logo from '../assets/MF-CPU-LOGO.png'; 
import { Image } from 'react-native';
import Home from '../assets/discover-icon-unselected.png'
import History from '../assets/time.png'

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

          return <Image source={route.name === 'Home' ? Home : History} style={{width:route.name === 'Home' ?25 :30,height:route.name === 'Home' ?25 :35}}/>;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarActiveBackgroundColor:'#f2d25d',
        tabBarInactiveBackgroundColor:'#FFF8E1',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerLeft: () => <ProfileIcon />,
          headerRight: () => <CartIcon />,
          headerTitle: () => (
            <Image
              source={logo} // Adjust the path according to your project structure
              style={{ width: 150, height: 80 }} // Set the desired width and height
              resizeMode="contain" // Maintain the aspect ratio
            />
          ),
          headerStyle: {
            backgroundColor: '#f2d25d', // Light mustard yellow
            elevation: 5, // Shadow for Android
            shadowColor: '#000', // Shadow color
            shadowOffset: { width: 0, height: 2 }, // Shadow offset
            shadowOpacity: 0.3, // Shadow opacity
            shadowRadius: 3.5, // Shadow radius
            height: 79, // Increase header height
          },
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
