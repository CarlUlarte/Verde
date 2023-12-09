import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { useFonts } from "expo-font";

const NavBar = ({ activeScreen, setActiveScreen }) => {
  const navigation = useNavigation();

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
    setActiveScreen(screenName);
  };


  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => navigateToScreen("Leaderboards")}>
        <View
          style={[
            styles.navItem,
            activeScreen === "Leaderboards" && styles.activeNavItem,
          ]}
        >
          <Image
            style={[styles.rankLogo]}
            source={require("../assets/rank_logo0.png")}
          />
          {activeScreen === "Leaderboards" && (
            <Text style={styles.navText}>Rank</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen("Cards")}>
        <View
          style={[
            styles.navItem,
            activeScreen === "Cards" && styles.activeNavItem,
          ]}
        >
          <Image
            style={[
              styles.dardsLogo,
              activeScreen === "Cards" && styles.activeNavItem,
            ]}
            source={require("../assets/card_logo0.png")}
          />
          {activeScreen === "Cards" && (
            <Text style={styles.navText}>Assess</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToScreen("Profile")}>
        <View
          style={[
            styles.navItem,
            activeScreen === "Profile" && styles.activeNavItem,
          ]}
        >
          <Image
            style={[
              styles.profileLogo,
              activeScreen === "Profile" && styles.activeNavItem,
            ]}
            source={require("../assets/profile_logo0.png")}
          />
          {activeScreen === "Profile" && (
            <Text style={styles.navText}>Profile</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    marginTop: 10,
    width: "85%",
    height: "8%",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
  },

  navItem: {
    padding: 8,
    paddingHorizontal: 20,
    flexDirection: "row",
  },

  navText: {
    marginLeft: 10,
    color: "#33684E",
    fontFamily: "PoppinsRegular",
  },

  activeNavItem: {
    borderRadius: 50,
    backgroundColor: "#6BB888",
  },
});

export default NavBar;
