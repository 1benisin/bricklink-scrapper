// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/storage');
const env = require('../env');

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const storage = firebase.storage();
module.exports = { firestore, storage };
