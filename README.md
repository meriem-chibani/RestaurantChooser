# 🍽️ RestaurantChooser

[![React Native](https://github.com/meriem-chibani/RestaurantChooser/new/master?filename=README.md)


A mobile app that helps individuals and groups decide where to eat by  restaurant discovery .

## 📱 Key Features

### Screens Overview
| Screen | Key Functionality |
|--------|------------------|
| **SplashScreen** | Branded app launch experience |
| **HomeScreen** | Central hub with quick access to all features |
| **RestaurantsScreen** | Browse/search restaurants with filters (cuisine, price, rating) |
| **PeopleScreen** | Manage adding persons delete and edit |


### Core Capabilities
- **Restaurant Discovery**: View  profiles with ratings and type of cuisin
- **Group Coordination**: Create dining groups by filling forms
- **History**: Save past decisions and favorite restaurants

## 🛠️ Technical Stack
- **Frontend**: React Native (v0.72)
- **Navigation**: React Navigation v6
- **State Management**: Context API
- **Styling**: StyleSheet + Flexbox layout
- **Build Tools**: Metro Bundler

## 🚀 Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- React Native CLI
- Android Studio/Xcode (for emulators)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/meriem-chibani/RestaurantChooser.git
   cd RestaurantChooser


2. Install dependencies: npm install
3. Start the development server: npx react-native start
4. Run on platform: npx react-native run-android



/src
  /assets
    /images
    /fonts
  /components
    /RestaurantCard
    /VotingWidget
    ...
  /screens
    /DecisionScreen
    /RestaurantsScreen
    ...
  /contexts
  /utils
  App.js
  navigation.js


 Contributing

- Fork the project
- Create your feature branch (git checkout -b feature/your-feature)
- Commit changes (git commit -m 'Add some feature')
- Push to branch (git push origin feature/your-feature)
- Open a Pull Request


