import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDtIhzEp37FlD45MLxH8JoRoQkXSmhTOCo",
  authDomain: "nodejs-app-35da8.firebaseapp.com",
  projectId: "nodejs-app-35da8",
  storageBucket: "nodejs-app-35da8.appspot.com",
  messagingSenderId: "356098102735",
  appId: "1:356098102735:web:3c982de57f48825f3aeeba",
  measurementId: "G-DKJNDRTQ66"
};

const app = initializeApp(firebaseConfig);

export default app;