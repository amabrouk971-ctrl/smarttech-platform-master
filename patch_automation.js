import fs from 'fs';
let code = fs.readFileSync('src/components/admin/AutomationCMS.tsx', 'utf-8');

const replacement = `
  const runBirthdayJob = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'STUDENT')));
      let count = 0;
      snap.docs.forEach(async (d) => {
        const student = d.data();
        if (student.dateOfBirth) {
          const dob = new Date(student.dateOfBirth);
          if (dob.getMonth() + 1 === month && dob.getDate() === day) {
            count++;
            // Publish Birthday Event
            await addDoc(collection(db, 'events'), {
              id: 'evt_bday_' + d.id + '_' + today.getFullYear(),
              eventType: 'BIRTHDAY',
              studentId: d.id,
              payload: { studentName: student.name },
              status: 'PENDING',
              createdAt: today.toISOString()
            });
          }
        }
      });
      alert('تم تشغيل دورة أعياد الميلاد: ' + count + ' حالة تم رصدها.');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
    }
  };
`;

code = code.replace("const handleDelete = async (id: string) => {", replacement + "\n  const handleDelete = async (id: string) => {");

const btnReplacement = `
        <button 
          onClick={runBirthdayJob}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 mr-2"
        >
          <Play className="w-4 h-4" /> فحص أعياد الميلاد
        </button>
        <button 
`;

code = code.replace("<button \n          onClick={handleCreateRule}", btnReplacement + "          onClick={handleCreateRule}");

fs.writeFileSync('src/components/admin/AutomationCMS.tsx', code);
