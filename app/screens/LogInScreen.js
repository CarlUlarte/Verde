import React, { useState, useEffect } from "react";
import {
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const LogInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("Main", { screen: "Cards" });
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const onLogInPressed = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.replace("Main", { screen: "Cards" });
      })
      .catch((error) => {
        alert(error.code + ": " + error.message);
      });
  };
  const onSignUpPressed = () => {
    navigation.navigate("SignUp");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        style={styles.background}
        source={require("../assets/2.jpg")}
        resizeMode={"cover"}
      >
        <Text style={styles.loginText} adjustsFontSizeToFit>
          Login
        </Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.textInputs}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.textInputs}
        />

        <TouchableOpacity onPress={onLogInPressed} style={styles.logInButton}>
          <Text style={{ fontFamily: 'PoppinsRegular', fontSize: 18, color: "#fff" }}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.text1}>
          Don't have an account?{" "}
          <Text style={styles.link} onPress={onSignUpPressed}>
            Sign Up
          </Text>
        </Text>

        <Image
          resizeMode="center"
          source={require("../assets/headlogo.png")}
          style={{ width: '25%', height: '25%', marginTop: '-10%', marginBottom:'-35%' }}
        />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
  },

  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    marginTop: "105%",
    fontFamily: 'FiraSansBold',
    fontSize: 30,
    color: "#33684e",
    marginBottom: "8%",
  },

  textInputs: {
    fontFamily: 'PoppinsRegular',
    backgroundColor: "#c0dccb",
    width: "70%",
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  logInButton: {
    marginTop: 6,
    backgroundColor: "#438967",
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 35,
    paddingLeft: 35,
    borderRadius: 15,
    elevation: 4,
    marginBottom: 10,
  },

  text1: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    alignSelf: "center",
  },
  link: {
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    color: "green",
  },
});

export default LogInScreen;
