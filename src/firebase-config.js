// firebase-config.js
import { firebase } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBguLNbw8FrAkfSJOmKWdyQgzOj1tfbwwM",
    authDomain: "mf-central-kitchen.firebaseapp.com",
    projectId: "mf-central-kitchen",
    storageBucket: "mf-central-kitchen.appspot.com",
    messagingSenderId: "624332125006",
    appId: "1:624332125006:web:0e385dd236727484b0a41f",
    measurementId: "G-DLB2CKWCP6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firestore };
