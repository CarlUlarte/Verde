import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";

import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Pressable,
  Modal,
  ImageBackground,
  Dimensions,
} from "react-native";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
const containerWidth = screenWidth * 0.85;

function LeaderboardsScreen(props) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState("daily");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topThreeData, setTopThreeData] = useState([]);
  const default_profile_pic_url = require("../assets/default_profile_pic.png");

  useEffect(() => {
    const leaderboardCollection = collection(db, "users");

    const unsubscribe = onSnapshot(leaderboardCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        dailyPoints: doc.data().DailyPoints,
        weeklyPoints: doc.data().WeeklyPoints,
        totalPoints: doc.data().TotalPoints,
        username: doc.data().Username,
        profileImageUrl: doc.data().profileImageUrl,
      }));

      setLeaderboardData(
        data.sort((a, b) =>
          leaderboardType === "daily"
            ? b.dailyPoints - a.dailyPoints
            : b.weeklyPoints - a.weeklyPoints
        )
      );

      setTopThreeData(data.slice(0, 3));
    });

    return () => unsubscribe();
  }, [leaderboardType]);

  return (
    <SafeAreaView
      style={[
        styles.background,
        {
          backgroundColor: leaderboardType === "daily" ? "#C0DCCB" : "#5FA67A",
        },
      ]}
    >
      <Text
        style={[
          styles.leaderboardTitle,
          {
            color: leaderboardType === "daily" ? "#5FA67A" : "#C0DCCB",
          },
        ]}
      >
        Leaderboard
      </Text>
      <TouchableOpacity
        style={[
          styles.switchButton,
          {
            backgroundColor:
              leaderboardType === "daily" ? "#74C192" : "#C0DCCB",
          },
        ]}
        onPress={() =>
          setLeaderboardType((prevType) =>
            prevType === "daily" ? "weekly" : "daily"
          )
        }
      >
        <View>
          <Text style={styles.toggleButton}>
            {leaderboardType === "daily" ? "Weekly >" : "< Daily"}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.bestContainer}>
        <ImageBackground
          source={require("../assets/bestcontwp.jpg")}
          resizeMode="cover"
          style={styles.bestBackground}
        />
        <ScrollView
          style={[styles.scrollTopThree, { backgroundColor: "transparent" }]}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          snapToInterval={containerWidth}
          overScrollMode="never"
          decelerationRate={"fast"}
        >
          {topThreeData.map((user, index) => (
            <View
              key={user.id}
              style={[styles.topContainer, { width: containerWidth }]}
            >
              <Image
                style={styles.topImage}
                source={
                  user.profileImageUrl
                    ? { uri: user.profileImageUrl }
                    : default_profile_pic_url
                }
              />
              <View style={styles.topTexts}>
                <Text style={styles.idk}>Rank {index + 1}</Text>
                <Text style={styles.topUsername}>{user.username}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        style={[
          styles.rankingsContainer,
          {
            backgroundColor:
              leaderboardType === "daily" ? "#A9D3B9" : "#7BC296",
          },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {leaderboardData.map((rank, index) => (
          <Pressable
            key={rank.id}
            style={({ pressed }) => [
              styles.rankOne,
              {
                backgroundColor:
                  index === 0
                    ? "#5FA67A"
                    : index === 1
                    ? "#6BB888"
                    : index === 2
                    ? "#81CD9E"
                    : index === 3
                    ? "#A3E0BB"
                    : index === 4
                    ? "#B4DBC3"
                    : "#B4DBC3",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => setSelectedUser(rank)}
          >
            <View style={styles.imageplusname}>
              <Text style={styles.rankPositions}>{index + 1}</Text>
              <Image
                style={styles.userImage}
                source={
                  rank.profileImageUrl
                    ? { uri: rank.profileImageUrl }
                    : default_profile_pic_url
                }
              />
              <Text
                style={styles.userRank}
                adjustsFontSizeToFit
              >{` ${rank.username}`}</Text>
            </View>

            <View style={styles.vpoints}>
              <Image
                style={styles.vpointimage}
                source={require("../assets/vpoints.png")}
              />
              <Text style={styles.userPoints}>
                {leaderboardType === "daily"
                  ? rank.dailyPoints
                  : rank.weeklyPoints}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedUser !== null}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalUsername}>{selectedUser?.username}</Text>
          <Image
            style={styles.modalUserImage}
            source={
              selectedUser?.profileImageUrl
                ? { uri: selectedUser?.profileImageUrl }
                : default_profile_pic_url
            }
          />
          <View
            style={{
              backgroundColor: "#F4F4F4",
              width: "90%",
              borderRadius: 25,
              alignItems: "center",

              height: "50%",
            }}
          >
            <Text
              style={{
                marginTop: 10,
                color: "green",
                fontFamily: "PoppinsMedium",
                marginBottom: 20,
              }}
            >
              V Points:
            </Text>
            <View style={styles.userDailyVpointsContainer}>
              <Text style={styles.userDailyPoints}>
                Daily: {selectedUser?.dailyPoints}
              </Text>
            </View>
            <View style={styles.userWeeklyVpointsContainer}>
              <Text style={styles.userWeeklyPoints}>
                Weekly: {selectedUser?.weeklyPoints}
              </Text>
            </View>
            <View style={styles.userOverallVpointsContainer}>
              <Text style={styles.userOverallPoints}>
                All-time: {selectedUser?.totalPoints}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => setSelectedUser(null)}>
            <Text style={styles.closeModalText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#C0DCCB",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  leaderboardTitle: {
    alignItems: "center",
    marginTop: 5,
    marginBottom:'3%',
    fontSize: screenHeight * 0.03,
    color: "#4E9F77",
    fontFamily: "FiraSansBold",
  },

  switchButton: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 20,
    elevation: 2,
  },

  toggleButton: {
    color: "green",
    fontFamily: "PoppinsRegular",
  },

  bestContainer: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.25,
    overflow: "hidden",
    borderRadius: 15,
    borderColor: "#5FA67A",
    borderWidth: 2,
    marginTop: 10,
    marginBottom: 10,
    // elevation: 3,
    position: "relative",
  },

  bestBackground: {
    flex: 1,
    opacity: 0.1,
  },

  scrollTopThree: {
    backgroundColor: "transparent",
    position: "absolute",
    // alignItems: "center",
    // justifyContent: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  topContainer: {
    alignItems: "center",
    justifyContent: "space-evenly",
    alignSelf: "center",
    height: screenHeight * 0.85,
    flexDirection: "row",
  },

  topImage: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.35,
    borderRadius: (screenWidth * 0.35) / 2,
    borderWidth: 8,
    borderColor: "#33684E",
    marginBottom: 10,
  },
  topTexts: {
    alignItems: "center",
  },

  topUsername: {
    fontSize: screenHeight * 0.03,
    color: "#33684E",
    fontFamily: "PoppinsBold",
  },

  idk: {
    fontSize: screenHeight * 0.02,
    color: "#33684E",
    fontFamily: "PoppinsRegular",
  },

  rankingsContainer: {
    marginTop: 5,
    width: "85%",
    maxHeight: "50%",
    backgroundColor: "#A9D3B9",
    borderRadius: 10,
    paddingTop: 5,
    paddingBottom: 5,
    elevation: 2,
  },

  rankOne: {
    width: "95%",
    height: 61,
    backgroundColor: "#5FA67A",
    borderRadius: 15,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingLeft: 15,
    alignSelf: "center",
    elevation: 1,
  },

  imageplusname: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.5,
  },

  rankPositions: {
    fontFamily: "PoppinsLight",
    color: "#33684E",
    marginRight: 10,
  },

  userImage: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    borderRadius: (screenWidth * 0.1) / 2,
    borderWidth: 2,
    borderColor: "#33684E",
  },

  userRank: {
    paddingLeft: 10,
    fontSize: screenHeight * 0.018,
    color: "#33684E",
    fontFamily: "PoppinsRegular",
  },

  vpoints: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.5,
    marginLeft: 50,
  },

  vpointimage: {
    width: screenWidth * 0.05,
    height: screenWidth * 0.05,
    marginRight: 10,
  },

  userPoints: {
    fontFamily: "PoppinsMedium",
    color: "white",
    fontSize: screenHeight * 0.018,
  },

  modalContainer: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: "10%",
    paddingTop: "10%",
    width: "98%",
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    alignSelf: "center",
  },

  modalUsername: {
    fontSize: 24,
    marginBottom: 10,
    color: "#5FA67A",
    fontFamily: "PoppinsBold",
  },

  modalUserImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 5,
    borderColor: "#5FA67A",
  },

  modalBio: {
    fontSize: 14,
    marginBottom: 10,
    color: "green",
    fontFamily: "PoppinsLightItalic",
  },

  closeModalText: {
    fontSize: 18,
    color: "#33684E",
    fontFamily: "PoppinsRegular",
    position: "absolute",
    alignSelf: "center",
    bottom: -50,
  },

  userDailyVpointsContainer: {
    width: "70%",
    height: "18%",
    backgroundColor: "#A3E0BB",
    borderRadius: 40,
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: "#5FA67A",
    alignItems: "center",
    justifyContent: "center",
    // elevation: 3,
  },
  userWeeklyVpointsContainer: {
    width: "70%",
    height: "18%",
    backgroundColor: "#A3E0BB",
    borderRadius: 40,
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: "#5FA67A",
    alignItems: "center",
    justifyContent: "center",
    // elevation: 3,
  },
  userOverallVpointsContainer: {
    width: "70%",
    height: "18%",
    backgroundColor: "#FAFFDE",
    borderRadius: 40,
    // borderWidth: 1,
    // borderColor: "#5FA67A",
    alignItems: "center",
    justifyContent: "center",
    // elevation: 3,
  },

  userDailyPoints: {
    fontFamily: "PoppinsRegular",
    color: "#FFFFFF",
  },

  userWeeklyPoints: {
    fontFamily: "PoppinsRegular",
    color: "#FFFFFF",
  },

  userOverallPoints: {
    fontFamily: "PoppinsRegular",
    color: "#5FA67A",
  },
});

export default LeaderboardsScreen;
