import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup } from 'firebase/auth';
const app = initializeApp({ projectId: "foo", appId: "bar", apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk" });
const auth = getAuth(app);
try {
  await signInWithPopup(auth, "google");
} catch(e) {
  console.log("popup string:", e.code);
}
