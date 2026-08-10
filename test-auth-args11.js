import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

try {
  onAuthStateChanged(undefined, () => {});
} catch(e) {
  console.log("onAuthStateChanged undefined:", e.code, e.message);
}
