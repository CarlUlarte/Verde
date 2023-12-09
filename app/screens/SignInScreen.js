import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const SignInScreen = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();

  const onSignInPressed = () => {
    navigation.navigate("LogIn");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/1.jpg")}
        style={styles.background}
        resizeMode={"cover"}
      >
        <Image source={require("../assets/logo_3.png")} style={styles.logo} />
        <Text adjustsFontSizeToFit style={styles.welcomeText}>
          Welcome to Verde!
        </Text>
        <Text style={styles.descriptionText}>
          Transform your daily routine into a green adventure. {"\n"}
          Answer quick questions, earn points, and compete {"\n"}
          with friends for a more sustainable lifestyle!
        </Text>
        <TouchableOpacity onPress={onSignInPressed} style={styles.getStarted}>
          <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 14, color: "#CBE894" }}>Get Started</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  background: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },

  logo: {
    width: "40%",
    height: "25%",
    marginTop: "25%",
  },

  welcomeText: {
    fontFamily: 'FiraSansBold',
    fontSize: 30,
    color: "#33684e",
    marginTop: "10%",
  },

  descriptionText: {
    marginTop: 10,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: "#5fa67a",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowRadius: 2,
  },

  getStarted: {
    marginTop: "10%",
    backgroundColor: "#438967",
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 15,
    elevation: 4,
  },
});

export default SignInScreen;
