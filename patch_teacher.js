import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/TeacherDashboard.tsx', 'utf-8');

if (!code.includes("import { EventEngine }")) {
  code = code.replace(
    "import { Course, Session, User, Conversation, Message } from '../../types';",
    "import { Course, Session, User, Conversation, Message } from '../../types';\nimport { EventEngine } from '../../lib/EventEngine';"
  );
}

// Replace endSession logic
const startIdx = code.indexOf("const endSession = async () => {");
const endIdx = code.indexOf("await Promise.all([...attPromises, ...concPromises]);") + "await Promise.all([...attPromises, ...concPromises]);".length;

const replacement = `const endSession = async () => {
    if (!activeSession || !currentUser) return;
    try {
      const currentStudents = Object.keys(attendance).map(id => sessionStudents.find(s => s.id === id)).filter(Boolean);

      // Save all attendance records and publish events
      const attPromises = Object.entries(attendance).map(async ([studentId, status]) => {
        const student = currentStudents.find(s => s?.id === studentId);
        const docRef = await addDoc(collection(db, 'attendanceRecords'), {
          studentId,
          sessionId: activeSession.id,
          courseId: activeSession.courseId,
          teacherId: currentUser.id,
          status,
          method: 'MANUAL',
          timestamp: new Date().toISOString(),
          recordedBy: currentUser.id
        });

        // Publish Event instead of hardcoding notifications
        let eventType = 'ATTENDANCE_PRESENT';
        if (status === 'LATE') eventType = 'ATTENDANCE_LATE';
        if (status === 'ABSENT') eventType = 'ATTENDANCE_ABSENT';
        
        await EventEngine.publish({
          eventType: eventType as any,
          actorId: currentUser.id,
          studentId: studentId,
          courseId: activeSession.courseId,
          sessionId: activeSession.id,
          entityId: docRef.id,
          payload: {
            status,
            studentName: student?.name
          }
        });

        return docRef;
      });

      // Save all concentration records and publish events
      const concPromises = Object.entries(concentration).map(async ([studentId, score]) => {
        const student = currentStudents.find(s => s?.id === studentId);
        const docRef = await addDoc(collection(db, 'concentrationRecords'), {
          studentId,
          sessionId: activeSession.id,
          teacherId: currentUser.id,
          courseId: activeSession.courseId,
          score,
          scale: 100,
          teacherNoteVisibility: 'VISIBLE_TO_PARENT',
          teacherFeedback: feedback[studentId] || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await EventEngine.publish({
          eventType: 'CONCENTRATION_RECORDED',
          actorId: currentUser.id,
          studentId: studentId,
          courseId: activeSession.courseId,
          sessionId: activeSession.id,
          entityId: docRef.id,
          payload: {
            score,
            studentName: student?.name
          }
        });

        return docRef;
      });

      await Promise.all([...attPromises, ...concPromises]);
      
      // Publish Session Completed Event
      await EventEngine.publish({
        eventType: 'SESSION_COMPLETED',
        actorId: currentUser.id,
        courseId: activeSession.courseId,
        sessionId: activeSession.id,
        payload: {
          sessionTitle: activeSession.titleAr
        }
      });`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);

fs.writeFileSync('src/components/dashboards/TeacherDashboard.tsx', code);
