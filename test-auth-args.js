import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "baz"
});

const auth = getAuth(app);
try {
  await signInWithEmailAndPassword(auth, "", "");
} catch(e) {
  console.log("Empty:", e.code);
}
try {
  await signInWithEmailAndPassword(auth, undefined, undefined);
} catch(e) {
  console.log("Undefined:", e.code);
}
