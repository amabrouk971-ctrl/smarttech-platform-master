import fs from 'fs';
let code = fs.readFileSync('src/lib/EventEngine.ts', 'utf-8');

const replacement = `
      case 'BIRTHDAY':
        title = 'عيد ميلاد سعيد! 🎉';
        body = event.payload.studentName ? \`كل عام والطالب \${event.payload.studentName} بألف خير!\` : 'كل عام وأنت بخير!';
        break;
      case 'ATTENDANCE_PRESENT':
`;

code = code.replace("case 'ATTENDANCE_PRESENT':", replacement);

const resolveReplacement = `
      if (['EXAM_GRADED', 'ATTENDANCE_PRESENT', 'BIRTHDAY'].includes(event.eventType)) {
        recipients.add(event.studentId);
      }
`;

code = code.replace("if (['EXAM_GRADED', 'ATTENDANCE_PRESENT'].includes(event.eventType)) {", resolveReplacement);

fs.writeFileSync('src/lib/EventEngine.ts', code);
