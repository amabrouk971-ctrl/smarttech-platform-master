import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/ParentDashboard.tsx', 'utf-8');

if (!code.includes("import { EventEngine }")) {
  code = code.replace(
    "import { Course, Session, User, Conversation, Message } from '../../types';",
    "import { Course, Session, User, Conversation, Message } from '../../types';\nimport { EventEngine } from '../../lib/EventEngine';"
  );
}

const startIdx = code.indexOf("const sendMessage = async (conversation: Conversation) => {");
const endIdx = code.indexOf("setNewMessage('');", startIdx);

const replacement = `const sendMessage = async (conversation: Conversation) => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      const msgRef = await addDoc(collection(db, 'messages'), {
        conversationId: conversation.id,
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
        studentId: selectedChild?.id,
        payload: {
          text: newMessage,
          recipientId: conversation.teacherId
        }
      });

      `;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/components/dashboards/ParentDashboard.tsx', code);
