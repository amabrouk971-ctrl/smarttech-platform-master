import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/TeacherDashboard.tsx', 'utf-8');
if (!code.includes("import { EventEngine }")) {
  code = code.replace(
    "import { User, AttendanceSession, AttendanceRecord, ConcentrationRecord, Conversation, Message } from '../../types';",
    "import { User, AttendanceSession, AttendanceRecord, ConcentrationRecord, Conversation, Message } from '../../types';\nimport { EventEngine } from '../../lib/EventEngine';"
  );
}
fs.writeFileSync('src/components/dashboards/TeacherDashboard.tsx', code);
