import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

const app = initializeApp({
  projectId: "foo",
  appId: "bar",
  apiKey: "AIzaSyAJgUmXT4dYoPWuPOGcdB7AhE5yFAzKTrk"
});

try {
  initializeAuth(app, {
    persistence: [undefined]
  });
} catch(e) {
  console.log("initializeAuth undefined:", e.code, e.message);
}
