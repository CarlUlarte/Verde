import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import LeaderboardsScreen from "../screens/LeaderboardsScreen";
import CardsScreen from "../screens/CardsScreen";
import NavBar from "../screens/NavBar";

const Stack = createStackNavigator();

const MainStack = () => {
  const [activeScreen, setActiveScreen] = useState("Cards");
  return (
    <>
      <Stack.Navigator
        initialRouteName="Cards"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Cards" component={CardsScreen} />
        <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
      <NavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </>
  );
};

export default MainStack;