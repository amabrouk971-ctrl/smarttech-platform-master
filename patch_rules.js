import fs from 'fs';
let code = fs.readFileSync('firestore.rules', 'utf-8');

const additionalRules = `
    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /simulations/{simId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /learningPaths/{pathId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /announcements/{announcementId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /events/{eventId} {
`;

code = code.replace("    match /events/{eventId} {", additionalRules);
fs.writeFileSync('firestore.rules', code);
