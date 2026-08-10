import fs from 'fs';
let code = fs.readFileSync('firestore.rules', 'utf-8');

const replacement = `
    match /messages/{messageId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
    }
`;

const start = code.indexOf("match /messages/{messageId}");
const end = code.indexOf("match /events/{eventId}", start);

code = code.substring(0, start) + replacement + "    " + code.substring(end);
fs.writeFileSync('firestore.rules', code);
