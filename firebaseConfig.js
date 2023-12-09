import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-rAmBv9BcetN3zvV68V1--Fagj8BClNY",
  authDomain: "verde-666b7.firebaseapp.com",
  projectId: "verde-666b7",
  storageBucket: "verde-666b7.appspot.com",
  messagingSenderId: "986151399465",
  appId: "1:986151399465:web:782bc7d30b3232424b2c38",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth, db, storage };
