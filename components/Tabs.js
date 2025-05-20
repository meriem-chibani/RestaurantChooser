import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, Image, Platform } from 'react-native';
import PeopleScreen from '../screens/PeopleScreen';
import DecisionScreen from '../screens/DecisionScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import Constants from 'expo-constants';

const Tab = createMaterialTopTabNavigator();

function Tabs() {
  const platformOS = Platform.OS;
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Decision"
        screenOptions={{
          tabBarActiveTintColor: '#ff0000', // Red
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 12 },
          tabBarStyle: {
            backgroundColor: 'powderblue',
            paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
          },
          animationEnabled: true,
          swipeEnabled: true,
          backBehavior: 'none',
          lazy: true,
          tabBarPosition: Platform.OS === 'ios' ? 'bottom' : 'top',

        }}
      >
        <Tab.Screen
          name="People"
          component={PeopleScreen}
          options={{
            tabBarLabel: 'People',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../assets/icon-people.png')} // Replace with your actual image path
                style={{ width: 20, height: 20, tintColor: color }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Decision"
          component={DecisionScreen}
          options={{
            tabBarLabel: 'Decision',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../assets/icon-decision.png')} // Replace with your actual image path
                style={{ width: 20, height: 20, tintColor: color }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Restaurants"
          component={RestaurantsScreen}
          options={{
            tabBarLabel: 'Restaurants',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../assets/icon-restaurants.png')} // Replace with your actual image path
                style={{ width: 20, height: 20, tintColor: color }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default Tabs;