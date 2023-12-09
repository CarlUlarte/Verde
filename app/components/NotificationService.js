import {
  getPermissionsAsync,
  scheduleNotificationAsync,
} from "expo-notifications";
import * as Notifications from "expo-notifications";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const registerDailyNotificationTask = async (notificationsEnabled) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("User not authenticated. Skipping notification scheduling.");
      return;
    }

    const notifDoc = await getDoc(doc(db, "users", user.uid));
    const notifData = notifDoc.exists() ? notifDoc.data() : {};

    if (!notifData.notificationsEnabled || !notificationsEnabled) {
      console.log(
        "Notifications not enabled. Skipping notification scheduling."
      );
      return;
    }

    const notifications = [
      {
        title: "Hey! Verde is waiting for you",
        body: "Dont forget to make green choices today.",
        trigger: { hour: 16, minute: 30, repeats: true },
      },
      {
        title: "Oh no! Your friends are ahead of you now",
        body: "Answer questions right now to reach them.",
        trigger: { hour: 18, minute: 30, repeats: true },
      },
    ];

    for (const notification of notifications) {
      await scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          icon: require("../assets/logo_3.png"),
        },
        trigger: notification.trigger,
      });
    }

    console.log("Notifications scheduled successfully");
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
};
