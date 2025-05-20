import React from "react";
import { Image, Platform } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PeopleScreen from "./screens/PeopleScreen";
import DecisionScreen from "./screens/DecisionScreen";
import RestaurantsScreen from "./screens/RestaurantsScreen";
import homeScreen from "./screens/homeScreen" ; 
import Constants from 'expo-constants';

const platformOS = Platform.OS.toLowerCase();
// console.log("PeopleScreen:", PeopleScreen);

const Tab = createMaterialTopTabNavigator();

export const Navigation = () => {
    return (
    <Tab.Navigator
    initialRouteName="DecisionScreen"
    screenOptions={{
    animationEnabled: true,
    swipEnabled: true,
    tabBarPosition: platformOS === "android" ? "top" : "bottom",
    tabBarActiveTintColor: "#ff6200",
    tabBarShowIcon: true,
    tabBarStyle: {
    paddingTop: platformOS === "android" ? Constants.statusBarnHeight : 0,
    },
}}
>
<Tab.Screen 
  name="PeopleScreen" 
  component={PeopleScreen} 
  options={{ 
    tabBarLabel: "People", 
    tabBarLabelStyle: {
      fontSize: 12, 
    },
    tabBarIcon: ({ color }) => (
      <Image 
        source={require("./assets/icon-people.png")} 
        style={{ width: 25, height: 25, tintColor: color }} 
      />
    ), 
  }} 
/>

<Tab.Screen 
  name="DecisionScreen" 
  component={DecisionScreen} 
  options={{ 
    tabBarLabel: "Decision", 
    tabBarLabelStyle: {
      fontSize: 12, 
    },
    tabBarIcon: ({ color }) => (
      <Image 
        source={require("./assets/icon-decision.png")} 
        style={{ width: 25, height: 25, tintColor: color }} 
      />
    ), 
  }} 
/>
<Tab.Screen
  name="RestaurantsScreen"
  component={RestaurantsScreen}
  options={{
    tabBarLabel: "Restaurants",
    tabBarLabelStyle: {
      fontSize: 12, 
    },
    tabBarIcon: ({ color }) => (
      <Image
        source={require("./assets/icon-restaurants.png")}
        style={{ width: 25, height: 25, tintColor: color }}
      />
    ),
  }}
/>
</Tab.Navigator>
    );
};


