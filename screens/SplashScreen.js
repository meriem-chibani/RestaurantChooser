// SplashScreen.js
import React, { useState, useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // If using React Navigation
import Tabs from '../components/Tabs';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation(); // If using React Navigation

  useEffect(() => {
    // Simulate a loading process (e.g., fetching data, checking authentication)
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Replace 'Main' with the name of your main screen
      navigation.replace('Tabs'); // Navigate after splash
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts
  }, []);

  if (isLoading) {
    return (
      <ImageBackground
        source={require('../assets/splash.png')} // Replace with your image
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Restaurant Chooser</Text>
          {/* Add any other elements you want on the splash screen */}
        </View>
      </ImageBackground>
    );
  }

  return null; // Or return <YourMainAppContent /> if not using React Navigation here
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional overlay
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SplashScreen;