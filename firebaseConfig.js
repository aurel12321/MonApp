// Import the functions you need from the SDKs you need

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { CACHE_SIZE_UNLIMITED, initializeFirestore } from "firebase/firestore";


// import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 
    authDomain: "monapp-95601.firebaseapp.com",
    databaseURL: "https://monapp-95601-default-rtdb.firebaseio.com",
    projectId: "monapp-95601",
    storageBucket: "monapp-95601.firebasestorage.app",
    messagingSenderId: "949724920960",
    appId: "1:949724920960:web:2944d55ffc1bf0e28d3a65",
    measurementId: "G-5E886HFFPH"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling:true,
    useFetchStreams: false,
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
// export const auth = getAuth(app);


