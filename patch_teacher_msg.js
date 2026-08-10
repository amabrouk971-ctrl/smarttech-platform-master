import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/TeacherDashboard.tsx', 'utf-8');

const startIdx = code.indexOf("const sendMessage = async () => {");
const endIdx = code.indexOf("setNewMessage('');", startIdx);

const replacement = `const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    try {
      const msgRef = await addDoc(collection(db, 'messages'), {
        conversationId: activeConversation.id,
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
        payload: {
          text: newMessage,
          recipientId: activeConversation.parentId
        }
      });

      `;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/components/dashboards/TeacherDashboard.tsx', code);
