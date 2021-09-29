import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import {firebaseConfig} from "./firebaseConfig"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const old = firebase.initializeApp({
  ...firebaseConfig,
  databaseURL: "https://cafe-order-226e5.firebaseio.com/"
}, 'old');

export const wel = firebase.initializeApp({
  ...firebaseConfig,
  databaseURL: "https://metree-welfare.firebaseio.com/"
}, 'wel');
//firebase.analytics();

export default firebase;
