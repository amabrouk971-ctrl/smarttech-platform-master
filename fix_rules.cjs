const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

// Fix support tickets
content = content.replace(/match \/support_tickets\/\{ticketId\} \{[\s\S]*?allow delete: if isAdmin\(\);\n    \}/, 
`match /support_tickets/{ticketId} {
      allow read: if isStaff() || (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isStaff() || (isAuthenticated() && resource.data.userId == request.auth.uid && request.resource.data.userId == resource.data.userId);
      allow delete: if isAdmin();
    }`);

// Fix notifications
content = content.replace(/match \/notifications\/\{document=\*\*\} \{[\s\S]*?allow delete: if isAdmin\(\);\n    \}/, 
`match /notifications/{document=**} {
      allow read: if isStaff() || (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow create: if isStaff();
      allow update: if isStaff() || (isAuthenticated() && resource.data.userId == request.auth.uid && request.resource.data.userId == resource.data.userId);
      allow delete: if isAdmin();
    }`);

// Fix bug reports
content = content.replace(/match \/bug_reports\/\{reportId\} \{[\s\S]*?allow delete: if isAdmin\(\);\n    \}/, 
`match /bug_reports/{reportId} {
      allow read: if isStaff() || (isAuthenticated() && resource.data.reporterId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.reporterId == request.auth.uid;
      allow update: if isStaff();
      allow delete: if isAdmin();
    }`);

// Fix audit logs & activity logs
content = content.replace(/match \/auditLogs\/\{document=\*\*\} \{[\s\S]*?allow update, delete: if false; \/\/ Audit logs should never be modified\n    \}/, 
`match /auditLogs/{document=**} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Audit logs should never be modified
    }`);

content = content.replace(/match \/activityLogs\/\{document=\*\*\} \{[\s\S]*?allow update, delete: if false;\n    \}/, 
`match /activityLogs/{document=**} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }`);

fs.writeFileSync('firestore.rules', content);
