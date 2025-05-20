import React from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { GluestackUIProvider } from "@gluestack-ui/themed-native-base";
import CustomTextInput from "../components/CustomTextInput";
import Toast from "react-native-toast-message";
import CustomButton from "../components/CustomButton" ;
import Delete from "../components/delete";


class ListScreen extends React.Component {
  constructor(inProps) {
  super(inProps);
  this.state = {
  listData: [],
  };
}

componentDidMount() {
  // Block hardware back button on Android.
  BackHandler.addEventListener("hardwareBackPress", () => true);

  // Get list of restaurants.
  this.loadRestaurants();
}

componentWillUnmount() {
  BackHandler.removeEventListener("hardwareBackPress");
}

loadRestaurants = async () => {
  try {
  const restaurants = await AsyncStorage.getItem("restaurants");
  const listData = restaurants ? JSON.parse(restaurants) : [];
  this.setState({ restaurantList: listData });
  } catch (error) {
  console.error("Failed to load restaurants:", error);
  }
};

deleteRestaurant = async (item) => {
  try {
  const restaurants = await AsyncStorage.getItem("restaurants");
  let listData = restaurants ? JSON.parse(restaurants) : [];
  listData = listData.filter((restaurant) => restaurant.key !== item.key);
  this.setState({ restaurantList: listData });

  Toast.show({
  type: 'error', // or 'success', 'info', etc.
  position: 'bottom',
  text1: 'Restaurant deleted',
  visibilityTime: 2000,
});

  } catch (error) {
  console.error("Failed to delete restaurant:", error);
  }
};
render() {
  return (
    <GluestackUIProvider>
    <View style={styles.listScreenContainer}>
    <CustomButton
        text="Add Restaurant"
        width="94%"
        onPress={() => this.props.navigation.navigate("AddScreen")}
    />
    <FlatList
    style={styles.restaurantList}
    data={this.state.restaurantList}
    keyExtractor={(item) => item.key}
    renderItem={({ item }) => (
        <View style={styles.restaurantContainer}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.cuisine}>Cuisine : {item.cuisine}</Text>
            <Text style={styles.adressdesc}>Adresse : {item.address}</Text>
            <Text style={styles.adressdesc}>Phone : {item.phone}</Text>
            <Text style={styles.adressdesc}>Dilevry : {item.delivery}</Text>
            <Text style={styles.restaurantRating}>Rating: {item.rating} stars</Text>
            <Delete
                text="Delete"
                onPress={() =>
                    Alert.alert(
                        "Please confirm",
                        "Are you sure you want to delete this restaurant?",
                        [
                            { text: "Yes", onPress: () => this.deleteRestaurant(item) },
                            { text: "No" },
              
                        ],
                        { cancelable: true }
                    )
                }
            />
        </View>
    )}
/>
</View>
</GluestackUIProvider>
  );
}
}

class AddScreen extends React.Component {
  constructor(inProps) {
  super(inProps);
  this.state = {
  name: "",
  cuisine: "",
  price: "",
  rating: "",
  phone: "",
  address: "",
  website: "",
  delivery: "",
  key: `r_${new Date().getTime()}_${Math.random()}`,
  errors: {}
  };
}

  validateName = (name) => {
    if (!name.trim()) {
      return "Restaurant name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (!/^[a-zA-Z0-9\s,'-]*$/.test(name)) {
      return "Name contains invalid characters";
    }
    return null;
  };

  validatePhone = (phone) => {
    if (!phone.trim()) {
        return "Phone number is required";
    }
    // Supports various phone formats:
    // - (123) 456-7890
    // - 123-456-7890
    // - 123.456.7890
    // - +91 (123) 456-7890
    // - etc.
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
        return "Please enter a valid phone number";
    }
    return null;
};

  validateAddress = (address) => {
    if (!address.trim()) {
        return "Address is required";
    }
    // Basic address validation - should contain at least a number and some text
    if (!/\d+/.test(address) || !/[a-zA-Z]/.test(address)) {
        return "Please enter a valid address (should include street number and name)";
    }
    if (address.length < 5) {
        return "Address is too short";
    }
    return null;
};

  validateWebsite = (website) => {
    if (!website.trim()) {
        return "Website is required";
    }
    try {
        // Enhanced URL validation that handles:
        // - http://example.com
        // - https://example.com
        // - www.example.com
        // - example.com
        // - subdomain.example.com
        // - paths (example.com/path)
        // - queries (example.com?query=param)
        // - ports (example.com:8080)
        const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?(\?\S*)?(:\d+)?$/;
        
        // Test basic URL structure
        if (!urlRegex.test(website)) {
            return "Please enter a valid website URL (e.g., example.com or https://example.com)";
        }
        
        // If URL doesn't start with http/https, check if it's valid without it
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
            // Test again with http:// prefixed to validate the domain
            if (!urlRegex.test(`http://${website}`)) {
                return "Please enter a valid website domain";
            }
        }
        
        // Additional security check for special characters
        if (/[<>"'{}|\\^~[\]`]/.test(website)) {
            return "URL contains invalid characters";
        }
        
    } catch (e) {
        return "Please enter a valid website URL";
    }
    
    return null;
};

  handleInputChange = (field, value) => {
    // Clear any existing error for this field when user types
    this.setState(prevState => ({
        [field]: value,
        errors: {
            ...prevState.errors,
            [field]: null
        }
    }));
};

  validateAllFields = () => {
    const { name, phone, address, website, cuisine, price, rating, delivery } = this.state;
    const errors = {
        name: this.validateName(name),
        phone: this.validatePhone(phone),
        address: this.validateAddress(address),
        website: this.validateWebsite(website),
        cuisine: !cuisine ? "Cuisine is required" : null,
        price: !price ? "Price is required" : null,
        rating: !rating ? "Rating is required" : null,
        delivery: !delivery ? "Please specify delivery option" : null
    };

    this.setState({ errors });
    return !Object.values(errors).some(error => error !== null);
};


saveRestaurant = async () => {
  

  const isValid = this.validateAllFields();
  
  if (!isValid) {
    // Now we can safely access this.state.errors
    const { errors } = this.state;
    
    // Find the first error field
    const firstErrorField = Object.keys(errors).find(key => errors[key]);
    
    if (firstErrorField) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Validation Error',
        text2: errors[firstErrorField],
        visibilityTime: 3000,
      });
    }
    return;
  }
    try {
      
      
      // Get the existing restaurants list from AsyncStorage
      const restaurants = await AsyncStorage.getItem("restaurants");

      // Parse the data if it exists, else use an empty array
      const restaurantList = restaurants ? JSON.parse(restaurants) : [];

      // Add the new restaurant to the list
      restaurantList.push(this.state);

      // Save the updated list back to AsyncStorage

      await AsyncStorage.setItem("restaurants", JSON.stringify(restaurantList));

      // Show success toast message
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Restaurant added successfully!",
        visibilityTime: 2000,
      });

      // Navigate to the ListScreen after saving the restaurant
      this.props.navigation.navigate("ListScreen");
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Failed to save restaurant! Try Again",
        visibilityTime: 2000,
      });
    }
  }
render() { 
  return (
      <ScrollView style={styles.addScreenContainer}>
          <View style={styles.addScreenInnerContainer}>
              <View style={styles.addScreenFormContainer}>
                  <CustomTextInput
                      label="Name"
                      maxLength={20}
                      stateHolder={this}
                      stateFieldName="name"
                      onChangeText={(text) => this.handleInputChange('name' , text)}
                      error = {this.state.errors.name}
                  />
                  <Text style={styles.fieldLabel}>Cuisine</Text>
                  <View style={[
                               styles.pickerContainer , 
                               this.state.errors.cuisine ? { borderColor: red} : {}
                  ]}>
                      <Picker
                          style={styles.picker}
                          selectedValue={this.state.cuisine}
                          onValueChange={(itemValue) => this.handleInputChange('cuisine', itemValue)}
                      >
                  <Picker.Item label="" value="" />
                  <Picker.Item label="Algerian" value="Algerian" />
                  <Picker.Item label="American" value="American" />
                  <Picker.Item label="Other" value="Other" />

                   </Picker>
                  </View>

                  {this.state.errors.cuisine && (
                  <Text style={{ color: 'red', marginLeft: 10, marginBottom: 10 }}>
                      {this.state.errors.cuisine}
                  </Text>
              )}
                  
                  
                  <Text style={styles.fieldLabel}>Price</Text>
                  <View style={[
                                  styles.pickerContainer ,
                                  this.state.errors.price ? {borderColor : 'red' } : {}  

                  ]}>

                      <Picker
                          style={styles.picker}
                          selectedValue={this.state.price}
                          onValueChange={(itemValue) => this.handleInputChange( 'price' , itemValue )}>

                          <Picker.Item label=" Select Price Range" value="" />
                          <Picker.Item label="$1" value="1" />
                          <Picker.Item label="$2" value="2" />
                          <Picker.Item label="$3" value="3" />
                          <Picker.Item label="$4" value="4" />
                          <Picker.Item label="$5" value="5" />
                      </Picker>
                  </View>

                  {this.state.errors.price && (
                  <Text style={{ color: 'red', marginLeft: 10, marginBottom: 10 }}>
                               {this.state.errors.price}
                  </Text>
                  )}

                  <Text style={styles.fieldLabel}>Rating</Text>
                  <View style={[styles.pickerContainer , 
                               this.state.errors.rating ? { borderColor: 'red' } : {} 
                  ]}>
                      <Picker
                          style={styles.picker}
                          selectedValue={this.state.rating}
                          onValueChange={(itemValue) => this.handleInputChange('rating', itemValue)}>
                          <Picker.Item label="Select a rating..." value="" />
                          <Picker.Item label="★" value="1" />
                          <Picker.Item label="★★" value="2" />
                          <Picker.Item label="★★★" value="3" />
                          <Picker.Item label="★★★★" value="4" />
                          <Picker.Item label="★★★★★" value="5" />
                      </Picker>
                  </View>
                  
                  {this.state.errors.rating && (
                  <Text style={{ color: 'red', marginLeft: 10, marginBottom: 10 }}>
                 {errors.rating}
                  </Text> )}


                   <CustomTextInput
                  label="Phone Number"
                  maxLength={20}
                  stateHolder={this}
                  stateFieldName="phone"
                  onChangeText={(text) => this.handleInputChange('phone', text)}
                  KeyboardType="phone-pad"
                  error = {this.state.errors.phone}
                  />

                  <CustomTextInput
                  label="Address"
                  maxLength={100}
                  stateHolder={this}
                  stateFieldName="address"
                  onChangeText={(text) => this.handleInputChange('address', text)}
                  error = {this.state.errors.address}
                  />
                  <CustomTextInput
                  label="Web Site"
                  maxLength={100}
                  stateHolder={this}
                  stateFieldName="website"
                  onChangeText={(text) => this.handleInputChange('website', text)}
                  KeyboardType = "url"
                  autoCapitalize = "none"
                  error = { this.state.errors.website }
                  />

                  <Text style={styles.fieldLabel}>Delivery?</Text>
                  <View style={styles.pickerContainer}>  
                      <Picker  
                      style={styles.picker}  
                      selectedValue={this.state.delivery}  
                      onValueChange={(itemValue) => this.setState({ delivery: itemValue })}  
                      >  
                      <Picker.Item label="" value="" />  
                      <Picker.Item label="Yes" value="Yes" />  
                      <Picker.Item label="No" value="No" />  
                      </Picker>  
                  </View>  
                  </View>  

                  <View style={styles.addScreenButtonsContainer}>  
                      <CustomButton  
                      text="Cancel"  
                      width="44%"  
                      onPress={() => this.props.navigation.navigate("ListScreen")}  
                      />  
                      <CustomButton  
                      text="Save"  
                      width="44%"  
                      onPress={this.saveRestaurant}  
                      />  
                      </View>  
                  </View>  
                  </ScrollView>  
                    );
                  }
                  }

const Stack = createStackNavigator();

const RestaurantsScreen = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="ListScreen"
        >
            <Stack.Screen name="ListScreen" component={ListScreen} />
            <Stack.Screen name="AddScreen" component={AddScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
  listScreenContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  restaurantList: {
    marginTop: 10,
  },
  restaurantContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  }, 
  adressdesc: {
    fontSize: 12,
    marginBottom: 5,
  },
  restaurantRating: {
    fontSize: 11,
    marginBottom: 5,
  },
  addScreenContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  addScreenInnerContainer: {
    padding: 15,
  },
  addScreenFormContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  addScreenButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});


export default RestaurantsScreen;