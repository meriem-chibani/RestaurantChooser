import React from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { GluestackUIProvider } from "@gluestack-ui/themed-native-base";
import CustomTextInput from "../components/CustomTextInput";
import Toast from "react-native-toast-message";
import CustomButton from "../components/CustomButton";
import Delete from "../components/delete";

class PeopleScreen extends React.Component {
  constructor(inProps) {
    super(inProps);
    this.state = {
      peopleList: [],
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    this.loadPeople();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress");
  }

  loadPeople = async () => {
    try {
      const people = await AsyncStorage.getItem("people");
      const peopleList = people ? JSON.parse(people) : [];
      this.setState({ peopleList });
    } catch (error) {
      console.error("Failed to load people:", error);
    }
  };

  deletePerson = async (item) => {
    try {
      const people = await AsyncStorage.getItem("people");
      let peopleList = people ? JSON.parse(people) : [];
      peopleList = peopleList.filter((person) => person.key !== item.key);
      await AsyncStorage.setItem("people", JSON.stringify(peopleList));
      this.setState({ peopleList });

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Person deleted',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Failed to delete person:", error);
    }
  };

  render() {
    return (
      <GluestackUIProvider>
        <View style={styles.listScreenContainer}>
          <CustomButton
            text="Add Person"
            width="94%"
            onPress={() => this.props.navigation.navigate("AddPersonScreen")}
          />
          <FlatList
            style={styles.peopleList}
            data={this.state.peopleList}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <View style={styles.personContainer}>
                <Text style={styles.personName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.relationship}>{item.relationship}</Text>
                <Image
                  source={require("../assets/default-avatar.png")} // Using default avatar if no image exists
                  style={styles.personImage}
                />
                <Delete
                  text="Delete"
                  onPress={() =>
                    Alert.alert(
                      "Please confirm",
                      "Are you sure you want to delete this person?",
                      [
                        { text: "Yes", onPress: () => this.deletePerson(item) },
                        { text: "No" },
                        { text: "Cancel", style: "cancel" },
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

class AddPersonScreen extends React.Component {
  constructor(inProps) {
    super(inProps);
    this.state = {
      firstName: "",
      lastName: "",
      relationship: "",
      key: `p_${new Date().getTime()}_${Math.random()}`,
    };
  }

  savePerson = async () => {
    const { firstName, lastName, relationship } = this.state;
    
    if (!firstName || !lastName || !relationship) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const people = await AsyncStorage.getItem("people");
      const peopleList = people ? JSON.parse(people) : [];
      
      const newPerson = {
        firstName,
        lastName,
        relationship,
        key: this.state.key,
      };

      peopleList.push(newPerson);
      await AsyncStorage.setItem("people", JSON.stringify(peopleList));

      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Person added successfully!",
        visibilityTime: 2000,
      });

      this.props.navigation.navigate("PeopleScreen");
    } catch (error) {
      console.error("Failed to save person:", error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Failed to save person!",
        visibilityTime: 2000,
      });
    }
  };

  render() {
    return (
      <ScrollView style={styles.addScreenContainer}>
        <View style={styles.addScreenInnerContainer}>
          <View style={styles.addScreenFormContainer}>
            <CustomTextInput
              label="First Name"
              maxLength={20}
              onChangeText={(text) => this.setState({ firstName: text })}
              value={this.state.firstName}
            />
            <CustomTextInput
              label="Last Name"
              maxLength={20}
              onChangeText={(text) => this.setState({ lastName: text })}
              value={this.state.lastName}
            />
            <Text style={styles.fieldLabel}>Relationship</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={this.state.relationship}
                onValueChange={(itemValue) => this.setState({ relationship: itemValue })}
              >
                <Picker.Item label="" value="" />
                <Picker.Item label="Family" value="Family" />
                <Picker.Item label="Friend" value="Friend" />
                <Picker.Item label="Coworker" value="Coworker" />
              </Picker>
            </View>
          </View>

          <View style={styles.addScreenButtonsContainer}>
            <CustomButton
              text="Cancel"
              width="44%"
              onPress={() => this.props.navigation.navigate("PeopleScreen")}
            />
            <CustomButton
              text="Save"
              width="44%"
              onPress={this.savePerson}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

const Stack = createStackNavigator();

const PeopleApp = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="PeopleScreen"
    >
      <Stack.Screen name="PeopleScreen" component={PeopleScreen} />
      <Stack.Screen name="AddPersonScreen" component={AddPersonScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  listScreenContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  peopleList: {
    marginTop: 10,
  },
  personContainer: {
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
  personName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  relationship: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  personImage: {
    padding: 50,
    right: -250,
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

export default PeopleApp;