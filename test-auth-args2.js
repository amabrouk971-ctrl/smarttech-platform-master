import { initializeApp } from 'firebase/app';
import { getAuth, getRedirectResult, onAuthStateChanged } from 'firebase/auth';

try {
  await getRedirectResult(undefined);
} catch(e) {
  console.log("getRedirectResult:", e.code);
}
try {
  onAuthStateChanged(undefined, () => {});
} catch(e) {
  console.log("onAuthStateChanged:", e.code);
}
