import React, { useState } from "react";
import {
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [points, setPoints] = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notif, setNotif] = useState(true);

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const onSignUpPressed = async () => {
    setLoading(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setLoading(false);

        setDoc(doc(db, "users", user.uid), {
          Username: username,
          Email: email,
          Password: password,
          TotalPoints: points,
          DailyPoints: dailyPoints,
          WeeklyPoints: weeklyPoints,
          surveyCompleted: surveyCompleted,
          currentIndex: currentIndex,
          notificationsEnabled: notif,
        });
      })
      .then(() => alert("Account created successfully 🎉"))
      .catch((error) => {
        alert(error.code + ": " + error.message);
      });

    navigation.navigate("LogIn");
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <ImageBackground
        source={require("../assets/3.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <Image
          resizeMode="center"
          source={require("../assets/headlogo.png")}
          style={{ width: '20%', height: '20%', marginTop: '-5%', marginBottom: '-15%' }}
        />

        <Text style={styles.signupText}>Sign Up</Text>

        <TextInput
          placeholder="Enter Username"
          value={username}
          setValue={setUsername}
          onChangeText={(text) => setUsername(text)}
          autoFocus
          style={styles.textInput}
        />

        <TextInput
          placeholder="Enter Email"
          value={email}
          setValue={setEmail}
          onChangeText={(text) => setEmail(text)}
          autoFocus
          style={styles.textInput}
        />
        <TextInput
          placeholder="Create Password"
          value={password}
          setValue={setPassword}
          onChangeText={(text) => setPassword(text)}
          autoFocus
          secureTextEntry
          style={styles.textInput}
        />
        <TouchableOpacity onPress={onSignUpPressed} style={styles.signUpButton}>
          <Text style={{fontFamily: 'PoppinsRegular', fontSize: 18, color: "#fff" }}>Sign Up</Text>
        </TouchableOpacity>
      </ImageBackground>
    </KeyboardAvoidingView>
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

  signupText: {
    fontFamily: 'FiraSansBold',
    fontSize: 25,
    color: "#33684e",
    marginBottom: '10%',
    marginTop: '1%',
  },

  textInput: {
    fontFamily: 'PoppinsRegular',
    minWidth: "80%",
    minHeight: 50,
    backgroundColor: "#C0DCCB",
    marginBottom: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  signUpButton: {
    fontFamily: 'PoppinsRegular',
    backgroundColor: "#438967",
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 35,
    paddingLeft: 35,
    borderRadius: 15,
    elevation: 4,
    marginTop: 50,
    marginBottom: 10,
  },
});

export default SignUpScreen;
