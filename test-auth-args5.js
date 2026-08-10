import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk"
});

const auth = getAuth(app);
try {
  await signInWithEmailAndPassword(auth, null, null);
} catch(e) {
  console.log("signIn-null:", e.code);
}
