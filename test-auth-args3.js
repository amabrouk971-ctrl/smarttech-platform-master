import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk"
});

const auth = getAuth(app);
try {
  await signInWithEmailAndPassword(auth, "invalid-email", "pass");
} catch(e) {
  console.log("signIn:", e.code);
}
try {
  await signInWithEmailAndPassword(auth, undefined, undefined);
} catch(e) {
  console.log("signIn-undefined:", e.code);
}
try {
  await sendPasswordResetEmail(auth, undefined);
} catch(e) {
  console.log("reset:", e.code);
}
