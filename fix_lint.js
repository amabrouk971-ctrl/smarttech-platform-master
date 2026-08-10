import fs from 'fs';

// Fix AutomationCMS.tsx
let autoCode = fs.readFileSync('src/components/admin/AutomationCMS.tsx', 'utf-8');
autoCode = autoCode.replace("targetRole: 'PARENT'", "targetRole: 'PARENT' as any");
autoCode = autoCode.replace("collection, query, getDocs, doc, addDoc, deleteDoc, updateDoc", "collection, query, getDocs, doc, addDoc, deleteDoc, updateDoc, where");
fs.writeFileSync('src/components/admin/AutomationCMS.tsx', autoCode);

// Fix AdminDashboard.tsx
let adminCode = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf-8');
adminCode = adminCode.replace("import { Zap, ShieldAlert,", "import { Zap, ShieldAlert, Users,");
fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', adminCode);

// Fix ParentDashboard.tsx
let parentCode = fs.readFileSync('src/components/dashboards/ParentDashboard.tsx', 'utf-8');
parentCode = parentCode.replace("import { Course, Session, User as AppUser, Conversation, Message } from '../../types';", "import { Course, User as AppUser, Conversation, Message } from '../../types';");
fs.writeFileSync('src/components/dashboards/ParentDashboard.tsx', parentCode);

// Fix TeacherDashboard.tsx
let teacherCode = fs.readFileSync('src/components/dashboards/TeacherDashboard.tsx', 'utf-8');
teacherCode = teacherCode.replace("const currentStudents = Object.keys(attendance).map(id => sessionStudents.find(s => s.id === id)).filter(Boolean);", "const currentStudents = students;"); // Students is defined in TeacherDashboard
if (!teacherCode.includes("import { EventEngine }")) {
  teacherCode = teacherCode.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { EventEngine } from '../../lib/EventEngine';");
}
fs.writeFileSync('src/components/dashboards/TeacherDashboard.tsx', teacherCode);
