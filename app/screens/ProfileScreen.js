import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Switch,
} from "react-native";

import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import {
  signOut,
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { firebase, storage, auth, db } from "../../firebaseConfig";
import { onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { registerDailyNotificationTask } from "../components/NotificationService";
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

function ProfileScreen(props) {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserInfo(docSnapshot.data());
      }
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  useEffect(() => {
    getData();
  }, []);

  // -------------------------MODALS----------------------------------------

  const [modalVisible, setModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);

  //------------------------PROFILE-----------------------------------------

  const [newUsername, setNewUsername] = useState(userInfo?.Username || "");
  const [newEmail, setNewEmail] = useState(userInfo?.Email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  //-------------------Handles----------------------

  const handleEditProfile = () => {
    setNewUsername(userInfo?.Username);
    setNewEmail(userInfo?.Email);
    setCurrentPassword("");
    setModalVisible(true);
  };

  const handlePickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking an image", error);
    }
  };

  const uploadImageToFirebase = async (uri, userId) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profileImages/${userId}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", userId), {
        profileImageUrl: downloadURL,
      });

      console.log("Image uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; 
    }
  };

  const handleEditProfileSave = async () => {
    const user = auth.currentUser;

    if (!currentPassword) {
      alert("Please enter your current password for verification.");
      return;
    }

    const credentials = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      setLoading(true);
      await reauthenticateWithCredential(user, credentials);

      await updateEmail(user, newEmail);
      await updateDoc(doc(db, "users", user.uid), {
        Username: newUsername,
        Email: newEmail,
      });

      if (selectedProfileImage) {
        await uploadImageToFirebase(selectedProfileImage, auth.currentUser.uid);

        setSelectedProfileImage(null);
      }

      alert("Profile updated successfully.");
      setModalVisible(false);
    } catch (error) {
      alert(`Reauthentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }

    setCurrentPassword("");
  };

  const handleChangePasswordSave = async () => {
    const user = auth.currentUser;

    if (!currentPassword) {
      alert("Please enter your current password for verification.");
      return;
    }

    const credentials = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      setLoading(true);
      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);
      await updateDoc(doc(db, "users", user.uid), {
        Password: newPassword,
      });

      alert("Password changed successfully.");
      setChangePasswordModalVisible(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    } catch (error) {
      alert(`Reauthentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToggle = async (notificationsEnabled) => {
    setNotificationsEnabled(notificationsEnabled);

    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        notificationsEnabled: notificationsEnabled,
      });
      registerDailyNotificationTask(notificationsEnabled);
    }
  };

  const handleNotifications = () => {
    setNotificationsModalVisible(true);
  };

  const handleFeedback = () => {
    setFeedbackModalVisible(true);
  };

  const handleFeedbackSend = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        feedback: [
          ...(userInfo?.feedback || []),
          {
            date: new Date(),
            message: feedbackMessage.trim(),
          },
        ],
      });

      getData();

      alert("Thank you for your feedback!");
      setFeedbackMessage("");
      setFeedbackModalVisible(false);
    } catch (error) {
      alert(`Error submitting feedback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModalVisible(true);
  };

  const deleteAccConfirm = async () => {
    const user = auth.currentUser;

    if (!currentPassword) {
      alert("Please enter your current password for verification.");
      return;
    }

    const credentials = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      setLoading(true);
      await reauthenticateWithCredential(user, credentials);

      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      await user.delete();

      alert("Account deleted successfully.");
      setDeleteAccountModalVisible(false);

      navigation.replace("Auth", { screen: "LogIn" });
    } catch (error) {
      alert(`Reauthentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      signOut(auth).then(() => {
        setLogoutModalVisible(false);
        navigation.replace("Auth", { screen: "LogIn" });
      });
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  //---------------------------UI------------------------

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.profileContainer}>
        <ImageBackground
          source={require("../assets/bestcontwp.jpg")}
          style={styles.profileContainerBg}
          resizeMode="cover"
        ></ImageBackground>
        <Image
          style={styles.displayPic}
          source={
            selectedProfileImage
              ? { uri: selectedProfileImage }
              : userInfo?.profileImageUrl
              ? { uri: userInfo?.profileImageUrl }
              : require("../assets/default_profile_pic.png")
          }
        />
        <View
          style={{
            paddingRight: 20,
            paddingLeft: 20,
            borderRadius: 15,
            backgroundColor: "#f4f4f4",
            marginTop: screenWidth * 0.015,
            marginBottom: screenWidth * 0.015,
          }}
        >
          <Text style={styles.userName}>{userInfo?.Username}</Text>
        </View>
        <View
          style={{
            backgroundColor: "#f4f4f4",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: screenWidth * 0.8,
            top: screenWidth * 0.035,
            borderRadius: 10,
            elevation: 2,
          }}
        >
          <View style={styles.userVpoints}>
            <Text
              style={{
                fontFamily: "PoppinsBold",
                color: "#5FA67A",

                fontSize: screenHeight * 0.023,
              }}
            >
              {userInfo?.DailyPoints}
            </Text>
            <Text
              style={{
                fontFamily: "PoppinsLight",
                fontSize: screenHeight * 0.014,
                color: "#5FA67A",
              }}
            >
              Daily
            </Text>
          </View>
          <View style={styles.userVpoints}>
            <Text
              style={{
                fontFamily: "PoppinsBold",
                color: "#5FA67A",
                fontSize: screenHeight * 0.023,
              }}
            >
              {userInfo?.WeeklyPoints}
            </Text>
            <Text
              style={{
                fontFamily: "PoppinsLight",
                fontSize: screenHeight * 0.014,

                color: "#5FA67A",
              }}
            >
              Weekly
            </Text>
          </View>
          <View style={styles.userVpoints}>
            <Text
              style={{
                fontFamily: "PoppinsBold",
                color: "#5FA67A",

                fontSize: screenHeight * 0.023,
              }}
            >
              {userInfo?.TotalPoints}
            </Text>
            <Text
              style={{
                fontFamily: "PoppinsLight",
                fontSize: screenHeight * 0.014,
                color: "#5FA67A",
              }}
            >
              All-time
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.settings}>
        <TouchableOpacity
          style={styles.editProfile}
          onPress={handleEditProfile}
        >
          <Image
            style={styles.settingsIcons}
            source={require("../assets/editprofile.png")}
          />
          <Text style={styles.settingsTexts}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changePassword}
          onPress={() => setChangePasswordModalVisible(true)}
        >
          <Image
            style={styles.settingsIcons}
            source={require("../assets/changepass.png")}
          />
          <Text style={styles.settingsTexts}>Change password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifications}
          onPress={handleNotifications}
        >
          <Image
            style={styles.settingsIcons}
            source={require("../assets/notification.png")}
          />
          <Text style={styles.settingsTexts}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedback} onPress={handleFeedback}>
          <Image
            style={styles.settingsIcons}
            source={require("../assets/feedback.png")}
          />
          <Text style={styles.settingsTexts}>Feedback</Text>
        </TouchableOpacity>
        <View
          style={{
            width: "90%",
            height: 1,
            backgroundColor: "lightgray",
            marginTop: 12,
            marginBottom: 12,
          }}
        ></View>
        <TouchableOpacity
          style={styles.deleteAcc}
          onPress={handleDeleteAccount}
        >
          <Image
            style={styles.settingsIcons}
            source={require("../assets/deleteacc.png")}
          />
          <Text style={[styles.settingsTexts, { color: "maroon" }]}>
            Delete account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logOut} onPress={handleLogout}>
          <Image
            style={styles.settingsIcons}
            source={require("../assets/logout.png")}
          />
          <Text style={{ fontFamily: "PoppinsRegular", color: "#fff" }}>
            Log-out
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "#4E9F77",
                    fontSize: 17,
                  }}
                >
                  Edit Profile
                </Text>
              </View>

              <TouchableOpacity onPress={handlePickProfileImage}>
                <Image
                  style={styles.modalDisplayPic}
                  source={
                    selectedProfileImage
                      ? { uri: selectedProfileImage }
                      : userInfo?.profileImageUrl
                      ? { uri: userInfo?.profileImageUrl }
                      : require("../assets/default_profile_pic.png")
                  }
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <TextInput
                style={styles.inputField}
                placeholder="Username"
                value={newUsername}
                onChangeText={(text) => setNewUsername(text)}
              />

              <TextInput
                style={styles.inputField}
                placeholder="Email"
                value={newEmail}
                onChangeText={(text) => setNewEmail(text)}
              />

              <View
                style={{
                  width: "90%",
                  height: 1,
                  backgroundColor: "lightgray",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              ></View>

              <TextInput
                style={styles.inputField}
                placeholder="Enter current password to confirm"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttons}
                  onPress={() => {
                    setNewUsername(userInfo?.Username);
                    setNewEmail(userInfo?.Email);
                    setCurrentPassword("");
                    setModalVisible(false);
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttons}
                  onPress={handleEditProfileSave}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={changePasswordModalVisible}
          onRequestClose={() => setChangePasswordModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.changePassModalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "#4E9F77",
                    fontSize: 17,
                  }}
                >
                  Change Password
                </Text>
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Current Password"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
              />

              <TextInput
                style={styles.inputField}
                placeholder="New Password"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={(text) => setNewPassword(text)}
              />

              <TextInput
                style={styles.inputField}
                placeholder="Confirm New Password"
                secureTextEntry={true}
                value={confirmNewPassword}
                onChangeText={(text) => setConfirmNewPassword(text)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttons}
                  onPress={() => {
                    setChangePasswordModalVisible(false);
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setCurrentPassword("");
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttons}
                  onPress={handleChangePasswordSave}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "PoppinsRegular",
                    }}
                  >
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={notificationsModalVisible}
          onRequestClose={() => setNotificationsModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.notificationsModalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "#4E9F77",
                    fontSize: 17,
                  }}
                >
                  Notifications
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    color: "darkgrey",
                    marginRight: 30,
                  }}
                >
                  Allow notifications
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81CD9E" }}
                  thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                  onValueChange={handleSwitchToggle}
                  value={notificationsEnabled}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttons}
                  onPress={() => {
                    setNotificationsModalVisible(false);
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={feedbackModalVisible}
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.feedbackModalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "#4E9F77",
                    fontSize: 17,
                  }}
                >
                  Feedback
                </Text>
              </View>
              <TextInput
                style={[styles.inputFieldFeedback, { height: 250 }]}
                placeholder="Type your feedback here"
                multiline
                value={feedbackMessage}
                onChangeText={(text) => setFeedbackMessage(text)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttons}
                  onPress={() => {
                    setFeedbackModalVisible(false);
                  }}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttons}
                  onPress={handleFeedbackSend}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteAccountModalVisible}
          onRequestClose={() => setDeleteAccountModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.delAccModalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "maroon",
                    fontSize: 17,
                  }}
                >
                  Delete Account
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "PoppinsRegular",
                  color: "maroon",
                  fontSize: 14,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Are you sure you want to delete your account? This action cannot
                be undone.
              </Text>

              <TextInput
                style={styles.inputField}
                placeholder="Enter your password to confirm"
                secureTextEntry
                value={currentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttons}
                  onPress={() => setDeleteAccountModalVisible(false)}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttons}
                  onPress={deleteAccConfirm}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={logoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <BlurView intensity={30} tint={"dark"} style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.logOutModalContent}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    color: "#4E9F77",
                    fontSize: 17,
                  }}
                >
                  Log-out
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "PoppinsRegular",
                  color: "green",
                  fontSize: 14,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Are you sure you want to log out?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.buttons}>
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttons}
                  onPress={handleSignOut}
                >
                  <Text style={{ color: "#fff", fontFamily: "PoppinsRegular" }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>

        <Modal
          transparent={true}
          animationType="fade"
          visible={loading}
          onRequestClose={() => setLoading(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                paddingHorizontal: 70,
                paddingVertical: 30,

                backgroundColor: "white",
                borderRadius: 15,
              }}
            >
              <ActivityIndicator size="large" color="green" />
              <Text style={{ marginTop: 5 }}>Loading...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#C0DCCB",
    alignItems: "center",
  },

  loading: {
    margin: 10,
  },

  profileContainer: {
    width: "100%",
    height: screenHeight * 0.33,
    backgroundColor: "#5FA67A",
    alignItems: "center",
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
  },

  profileContainerBg: {
    position: "absolute",
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    alignItems: "center",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    opacity: 0.065,
  },

  displayPic: {
    width: screenWidth * 0.34,
    height: screenWidth * 0.34,
    backgroundColor: "lightgrey",
    borderRadius: (screenWidth * 0.34) / 2,
    borderWidth: 3,
    borderColor: "#81CD9E",
    marginTop: screenWidth * 0.13,
  },

  userName: {
    fontFamily: "PoppinsBold",
    color: "#6BB888",
    fontSize: screenHeight * 0.02,
  },

  userVpoints: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 5,
    borderRadius: 15,
    width: screenWidth * 0.3,
    height: screenHeight * 0.07,
  },

  settings: {
    marginTop: screenHeight * 0.08,
    width: screenWidth * 0.9,
    height: screenHeight * 0.48,
    backgroundColor: "#fff",
    alignItems: "center",
    // justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 15,
  },

  editProfile: {
    width: "90%",
    height: "14%",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
  },

  changePassword: {
    width: "90%",
    height: "14%",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
  },

  notifications: {
    width: "90%",
    height: "14%",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
  },

  feedback: {
    width: "90%",
    height: "14%",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
  },

  deleteAcc: {
    width: "90%",
    height: "14%",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
    // marginTop: 5,
  },

  logOut: {
    width: "90%",
    height: "14%",
    backgroundColor: "#69B586",
    marginBottom: 5,
    borderRadius: 15,
    alignItems: "center",
    paddingLeft: 10,
    elevation: 1,
    flexDirection: "row",
  },

  settingsTexts: {
    fontFamily: "PoppinsRegular",
    color: "#6BB888",
  },

  settingsIcons: {
    width: 25,
    height: 25,
    marginRight: 15,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContent: {
    width: "85%",
    minHeight: 500,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  changePassModalContent: {
    width: "85%",
    minHeight: 350,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  notificationsModalContent: {
    width: "85%",
    minHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  delAccModalContent: {
    width: "85%",
    minHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  logOutModalContent: {
    width: "85%",
    minHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  feedbackModalContent: {
    width: "85%",
    minHeight: 400,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  modalDisplayPic: {
    width: 120,
    height: 120,
    backgroundColor: "lightgrey",
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#81CD9E",
    marginBottom: 20,
  },

  inputField: {
    width: "100%",
    height: 50,
    marginBottom: 10,
    paddingLeft: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 14,
    color: "darkgreen",
  },

  inputFieldFeedback: {
    width: "100%",
    height: 50,
    marginBottom: 10,
    padding: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    fontFamily: "PoppinsRegular",
    fontSize: 14,
    color: "darkgreen",
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: "5%",
  },

  buttons: {
    width: 100,
    padding: 5,
    backgroundColor: "#81CD9E",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
