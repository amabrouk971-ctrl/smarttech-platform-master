import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk"
});
const auth = getAuth(app);

try {
  await signInWithEmailAndPassword(auth);
} catch(e) {
  console.log("signIn no args:", e.code);
}

