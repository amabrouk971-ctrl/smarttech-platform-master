import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/ParentDashboard.tsx', 'utf-8');

const startIdx = code.indexOf("const sendMessage = async ");
const endIdx = code.indexOf("setNewMessage('');", startIdx) + "setNewMessage('');".length;

const replacement = `const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeTeacher || !selectedChild) return;
    try {
      // Find or create conversation
      const convId = currentUser.id + '_' + activeTeacher.id + '_' + selectedChild.id;
      
      const msgRef = await addDoc(collection(db, 'messages'), {
        conversationId: convId,
        senderId: currentUser.id,
        text: newMessage,
        type: 'TEXT',
        status: 'SENT',
        createdAt: new Date().toISOString()
      });

      await EventEngine.publish({
        eventType: 'MESSAGE_RECEIVED',
        actorId: currentUser.id,
        entityId: msgRef.id,
        studentId: selectedChild.id,
        payload: {
          text: newMessage,
          recipientId: activeTeacher.id
        }
      });

      setNewMessage('');`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/components/dashboards/ParentDashboard.tsx', code);
