import { initializeApp } from 'firebase/app';
import { initializeAuth, getRedirectResult, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk"
});

const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
});

try {
  await getRedirectResult(auth);
} catch(e) {
  console.log("getRedirectResult:", e.code, e.message);
}
