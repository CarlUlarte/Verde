import React, { useRef, useState, useEffect } from "react";
import { ScrollView, Animated, SafeAreaView, View, Dimensions, Image } from "react-native";
import { Surface, Text, TouchableRipple } from "react-native-paper";
import { StyleSheet } from 'react-native';
import { auth, db } from "../../firebaseConfig";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const OFFSET = 50;
const NUM_CARDS = 10;
const ITEM_WIDTH = Dimensions.get("window").width - OFFSET * 2;
const ITEM_HEIGHT = Dimensions.get('window').height / 2;
const SMALL_CARD_WIDTH = ITEM_WIDTH * 0.85;
const SMALL_CARD_HEIGHT = ITEM_HEIGHT * 0.70;
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const cards = [
 {
  id: "1",
  question: "Did you left your phone charging overnight?",
  choices: [
   { label: "Yes, for 7-8 hours", points: 10 },
   { label: "Yes, for 5-6 hours", points: 15 },
   { label: "Yes, for less than 4 hours", points: 20 },
   { label: "No, I didn't", points: 55 },
  ],
 },
 {
  id: "2",
  question: "What mode of transportation did you use today?",
  choices: [
   { label: "Public transportation", points: 15 },
   { label: "Private vehicle", points: 10 },
   { label: "Bicycle", points: 40 },
   { label: "Walking", points: 35 },
  ],
 },
 {
  id: "3",
  question: "Whant type of food did you consume today?",
  choices: [
   { label: "Mostly plant-based", points: 30 },
   { label: "Mix of plant-based and animal", points: 20 },
   { label: "All plant-based", points: 40 },
   { label: "Mostly animal-based", points: 10 },
  ],
 },
 {
  id: "4",
  question: "How did you carry your bought goods today?",
  choices: [
   { label: "Using my old reusable bag", points: 45 },
   { label: "Store-given paper bags", points: 25 },
   { label: "Store-given plastic bags", points: 10 },
   { label: "Combination of all", points: 20 },
  ],
 },
 {
  id: "5",
  question: "How many minutes did you spend in the shower today?",
  choices: [
   { label: "Less than 5 mins", points: 40 },
   { label: "5-10 minutes", points: 30 },
   { label: "10-15 minutes", points: 20 },
   { label: "More than 15 minutes", points: 10 },
  ],
 },
 {
  id: "6",
  question: "How did you manage your wastes today?",
  choices: [
   { label: "Kept recyclables and made compost", points: 1 },
   { label: "Kept recyclebles and threw the rest", points: 2 },
   { label: "Threw all but with proper waste management", points: 3 },
   { label: "Threw all without waste management", points: 4 },
  ],
 },
 {
  id: "7",
  question: "Did you turn off your computer and other electronics today?",
  choices: [
   { label: "Yes, of course", points: 1 },
   { label: "I fogrgot to turn them off", points: 2 },
   { label: "I used it all day", points: 3 },
   { label: "No, but only for a while", points: 4 },
  ],
 },
 {
  id: "8",
  question: "What type of packaging did you choose for your lunch today?",
  choices: [
    { label: "Reusable containers and plates", points: 45 },
    { label: "Paper or cardboard", points: 25 },
    { label: "Plastic containers", points: 10 },
    { label: "Combination of all", points: 20 },
  ],
 },
 {
  id: "9",
  question: "How many single-use items did you use today?",
  choices: [
    { label: "None, I avoided single-use items", points: 50 },
    { label: "1-2 items", points: 25 },
    { label: "3-5 items", points: 15 },
    { label: "More than 5 items", points: 10 },
  ],
 },
 {
  id: "10",
  question: "How did you print your papers today?",
  choices: [
   { label: "Used single-sided printing", points: 20 },
   { label: "Used double-sided printing", points: 30 },
   { label: "Mixture of both", points: 10 },
   { label: "I did not print anything", points: 40 },
  ],
 },
];

const getCardStyles = (item, idx, scrollX) => {
 const inputRange = [
  (idx - 1) * ITEM_WIDTH,
  idx * ITEM_WIDTH,
  (idx + 1) * ITEM_WIDTH,
 ];

 const translate = scrollX.interpolate({
  inputRange,
  outputRange: [0.85, 1, 0.85],
 });

 const opacity = scrollX.interpolate({
  inputRange,
  outputRange: [0.5, 1, 0.5],
 });

 return {
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
  marginLeft: item.id === "1" ? OFFSET : undefined,
  marginRight: item.id === String(NUM_CARDS) ? OFFSET : undefined,
  bottom: '2%',
  opacity,
  transform: [{ scale: translate }],
  borderRadius: 20,
  backgroundColor: "#5FA67A",
  shadowColor: "#000",
  shadowOffset: {
   width: 0,
   height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  justifyContent: "center",
  alignItems: "center",
 };
};

const CardsScreen = () => {
 const scrollX = useRef(new Animated.Value(0));
 const scrollViewRef = useRef(null);
 const [selectedOption, setSelectedOption] = useState(null);
 const [DailyPoints, setDailyPoints] = useState(0);
 const [TotalPoints, setTotalPoints] = useState(0);
 const [WeeklyPoints, setWeeklyPoints] = useState(0);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [surveyCompleted, setSurveyCompleted] = useState(false);
 const fadeInOpacity = useRef(new Animated.Value(0)).current;
 const [shouldFadeIn, setShouldFadeIn] = useState(false);
 

 const [userInfo, setUserInfo] = useState(null);

 const getData = async () => {
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, "users", userId);

  try {
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      setUserInfo(userData);

      if (userData.surveyCompleted) {
        setSurveyCompleted(true);
        setCurrentIndex(NUM_CARDS); 
        setDailyPoints(userData.DailyPoints);
        setWeeklyPoints(userData.WeeklyPoints);
        
      } else {
        setCurrentIndex(userData.currentIndex);
        setDailyPoints(userData.DailyPoints);
        setTotalPoints(userData.TotalPoints);
        setWeeklyPoints(userData.WeeklyPoints);
        
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            animated: true,
            x: ITEM_WIDTH * userData.currentIndex,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const resetDailyData = async () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  if (currentDay === 0 && currentHour === 0 && currentMinutes === 0) {
    setDailyPoints(0);
    setCurrentIndex(0);
    setSurveyCompleted(false);
    setWeeklyPoints(0);

    
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userId);

    await updateDoc(userDocRef, {
      DailyPoints: 0,
      currentIndex: 0,
      surveyCompleted: false,
      WeeklyPoints: 0,
    });
  }
  else if (currentHour === 0 && currentMinutes === 0) {
    setDailyPoints(0);
    setCurrentIndex(0);
    setSurveyCompleted(false);

    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userId);

    await updateDoc(userDocRef, {
      DailyPoints: 0,
      currentIndex: 0,
      surveyCompleted: false,
    });
  }
};


useEffect(() => {
  getData();
  const intervalId = setInterval(() => {
    resetDailyData();
  }, 60000);

  return () => clearInterval(intervalId);
}, []);


 const startFadeInAnimation = () => {
  Animated.timing(fadeInOpacity, {
   toValue: 1,
   duration: 1000,
   useNativeDriver: false,
  }).start();
 };

 useEffect(() => {
  if (surveyCompleted && !shouldFadeIn) {
   setShouldFadeIn(true);
   startFadeInAnimation();
  }
 }, [surveyCompleted, shouldFadeIn]);

 const handleChoiceSelection = async (points) => {
  setDailyPoints((prevPoints) => prevPoints + points);
  setTotalPoints((prevTotalPoints) => prevTotalPoints + points);
  setWeeklyPoints((prevWeeklyPoints) => prevWeeklyPoints + points);

  // Update user's data in Firestore
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, "users", userId);

  await updateDoc(userDocRef, {
    currentIndex: currentIndex + 1,
    DailyPoints: DailyPoints + points,
    TotalPoints: TotalPoints + points,
    WeeklyPoints: WeeklyPoints + points,
  });

  if (currentIndex < NUM_CARDS - 1) {
    setCurrentIndex((prevIndex) => prevIndex + 1);
    setSelectedOption(null);
  
    scrollViewRef.current.scrollTo({
      animated: true,
      x: ITEM_WIDTH * (currentIndex + 1),
    });
  } else {
    setSurveyCompleted(true);
    await updateDoc(userDocRef, { surveyCompleted: true });
  }
  
};

 return (
  <SafeAreaView style={styles.container}>

   <Image
    source={require('../assets/semibg.png')}
    style={styles.additionalImage}
   />

   <Image
    source={require('../assets/headlogo.png')}
    style={styles.logo}
   />

   <Text style={styles.titleText}> ASSESSMENT</Text>
   {surveyCompleted ? (
     <Animated.View style={[styles.completionContainer, { opacity: fadeInOpacity }]}>
     <Image
      source={require('../assets/Ok.png')}
      style={styles.completionImage}
     />
     <Text style={styles.completionText}>You've completed the daily assessment!</Text>
    </Animated.View>
   ) : (
    <>
     <ScrollView
      ref={scrollViewRef}
      horizontal={true}
      scrollEnabled={false} 
      decelerationRate={"normal"}
      snapToInterval={ITEM_WIDTH}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsHorizontalScrollIndicator={false}
      bounces={false}
      disableIntervalMomentum
      onScroll={Animated.event(
       [{ nativeEvent: { contentOffset: { x: scrollX.current } } }],
       { useNativeDriver: false }
      )}
      scrollEventThrottle={12}
      onMomentumScrollEnd={() => {
      const index = Math.round(scrollX.current._value / ITEM_WIDTH);

      // Ensure that the index is within the valid range
      const clampedIndex = Math.min(Math.max(index, 0), NUM_CARDS - 1);

      setCurrentIndex(clampedIndex);
    }}


     >
      {cards.map((item, idx) => (
       <Animated.View key={item.id} style={getCardStyles(item, idx, scrollX.current)}>
        <View style={styles.cardContainer}>
         <Text style={styles.questionText}>{item.question}</Text>
        </View>
        <View style={styles.smallCardContainer}>
         {item.choices.map((choice, index) => (
          <Surface key={index} style={styles.surface}>
           <TouchableRipple
            onPress={() => {
             setSelectedOption(choice.label);
             handleChoiceSelection(choice.points);
            }}
            style={styles.choiceButton}
           >
            <Text numberOfLines={2} style={styles.buttonText}>
             {choice.label}
            </Text>
           </TouchableRipple>
          </Surface>
         ))}
        </View>
       </Animated.View>
      ))}
     </ScrollView>

     <View style={styles.progressBackground} />
     <Animated.View
      style={styles.progressBar(scrollX.current)}
     />

     <View style={styles.DailyPointsContainer}>
      <Text style={styles.DailyPointsText}>Green Points:</Text>
      <Text style={styles.DailyPointsNumber}>{DailyPoints}</Text>
     </View>
    </>
   )}
  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: "#C0DCCB",
  paddingVertical: screenHeight*0.02,
 },
 logo: {
  width: (screenWidth*0.8)-150,
  height: (screenWidth*0.8)-150,
  alignSelf: 'center',
  top: (screenHeight*0.01)+15,
 },
 additionalImage: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: screenHeight / 2, 
  resizeMode: 'cover',
  opacity: 0.7,
 },
 scrollView: {
  paddingHorizontal: 0,
 },
 titleText: {
  fontSize: (screenHeight*0.07)-38,
  fontFamily: 'FiraSansBold', 
  color: '#55956E', 
  textAlign: 'center',
  top: '-5%'
 },
 scrollViewContent: {
  alignItems: "center",
 },
 cardContainer: {
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
  justifyContent: "center",
  alignItems: "center",
 },
 questionText: {
  fontSize: (screenHeight*0.07)-40,
  color: "white",
  fontFamily: 'PoppinsRegular',
  paddingHorizontal: 20,
 },
 smallCardContainer: {
  width: SMALL_CARD_WIDTH,
  height: SMALL_CARD_HEIGHT,
  backgroundColor: "#D9D9D9",
  borderRadius: 15,
  bottom: "40%",
  padding: 16,
 },
 surface: {
  marginVertical: SMALL_CARD_HEIGHT * 0.03,
  height: SMALL_CARD_HEIGHT * 0.173,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  backgroundColor: "white",
  borderRadius: 15,
  elevation: 2,
 },
 choiceButton: {
  flex: 1,
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
 },
 buttonText: {
  fontSize: (screenHeight*0.069)-41,
  color: "black",
  fontFamily: "PoppinsRegular",
  textAlign: "center",
  textAlignVertical: "center",
 },
 progressBackground: {
  position: "absolute",
  bottom: "12%",
  left: '3.2%',
  height: screenHeight*0.024,
  width: "93.2%",
  backgroundColor: "#D9D9D9",
  borderRadius: 10,
  borderWidth: 2,
  borderColor: "#FFFFFF",
 },
 progressBar: (scrollX) => ({
  position: "absolute",
  bottom: '12.3%',
  left: 15,
  height: screenHeight*0.018,
  backgroundColor: "#5FA67A",
  borderRadius: 10,
  width: scrollX.interpolate({
   inputRange: [0, ITEM_WIDTH * (NUM_CARDS - 1)],
   outputRange: ["0%", "92%"],
  }),
 }),
 DailyPointsContainer: {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FCFFEC',
  borderRadius: 15,
  borderWidth: 3,
  borderColor: '#5FA67A',
  height: (screenHeight * 0.1)-20,
  width: 100,
  padding: 2,
  bottom: (screenHeight * 0.2)-45,
  left: '38%',
 },
 DailyPointsText: {
  textAlign: 'center',
  fontFamily: 'FiraSansBold',
  fontSize: screenHeight * 0.012,
  color: "#55956E",
  bottom: -screenHeight*0.01,
 },
 DailyPointsNumber: {
  textAlign: 'center',
  fontFamily: 'FiraSansBold',
  fontSize: (screenHeight*0.08)-35,
  color: "#55956E",
  bottom: 5,
 },
 completionContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
 completionImage: {
  width: screenHeight*0.4, 
  height: screenHeight*0.4, 
  bottom: '10%', 
 },
 completionText: {
  fontSize: (screenHeight*0.04)-10,
  fontFamily: 'FiraSansBold',
  color: '#55956E',
  textAlign: 'center',
  bottom:'5%',
 },
});

export default CardsScreen;