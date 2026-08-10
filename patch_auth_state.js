import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("onAuthStateChanged")) {
  code = code.replace("import { auth, googleProvider }", "import { auth, googleProvider, onAuthStateChanged }");
  if (!code.includes("onAuthStateChanged")) {
     code = code.replace("import { subscribeToCourses } from './services/firebaseService';", "import { subscribeToCourses } from './services/firebaseService';\nimport { auth } from './firebase/config';\nimport { onAuthStateChanged } from 'firebase/auth';\nimport { doc, getDoc } from 'firebase/firestore';\nimport { db } from './firebase/config';");
  }

  const authStateEffect = `
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            setCurrentUser(userData);
            setCurrentRole(userData.role);
            if (userData.role === Role.STUDENT) {
              setXpPoints(userData.xp || 1450);
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubAuth();
  }, []);
`;

  code = code.replace("const [authModalOpen, setAuthModalOpen] = useState(false);", "const [authModalOpen, setAuthModalOpen] = useState(false);\n" + authStateEffect);
  
  fs.writeFileSync('src/App.tsx', code);
}
