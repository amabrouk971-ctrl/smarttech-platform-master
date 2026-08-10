import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';

try {
  await signInWithEmailAndPassword(undefined, "test@test.com", "pass");
} catch(e) {
  console.log("signInWithEmail:", e.code, e.message);
}
