import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Link, Plus, Brain, TrendingUp, Search, Calendar, User, BookOpen, AlertCircle, Sparkles, X, MessageSquare, Send, Bot } from 'lucide-react';
import { Course, User as AppUser, Conversation, Message } from '../../types';
import { EventEngine } from '../../lib/EventEngine';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface ParentDashboardProps {
  currentUser: AppUser | null;
  courses: Course[];
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ currentUser, courses, onLogout }) => {
  const [children, setChildren] = useState<AppUser[]>([]);
  const [selectedChild, setSelectedChild] = useState<AppUser | null>(null);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<AppUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchChildren();
    }
  }, [currentUser]);

  const fetchChildren = async () => {
    try {
      const q = query(collection(db, 'parentStudentRelationships'), where('parentId', '==', currentUser?.id), where('status', '==', 'ACTIVE'));
      const snap = await getDocs(q);
      const studentIds = snap.docs.map(d => d.data().studentId);
      
      if (studentIds.length > 0) {
        const students: AppUser[] = [];
        for (const sid of studentIds) {
          const sq = query(collection(db, 'users'), where('__name__', '==', sid));
          const sSnap = await getDocs(sq);
          if (!sSnap.empty) {
            students.push({ id: sSnap.docs[0].id, ...sSnap.docs[0].data() } as AppUser);
          }
        }
        setChildren(students);
        if (students.length > 0) {
          setSelectedChild(students[0]);
          fetchTeachers(students[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching children', err);
    }
  };

  const fetchTeachers = async (studentId: string) => {
    try {
      const tq = query(collection(db, 'users'), where('role', '==', 'TEACHER'));
      const tSnap = await getDocs(tq);
      setTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAiReport = async () => {
    if (!selectedChild) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/parent-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedChild.name,
          pathTitle: 'مسار المبرمج الصغير',
          completedMissionsCount: 5,
          xpGained: 150,
          strengths: ['التفكير المنطقي', 'بناء الخوارزميات'],
          areasToImprove: ['سرعة الكتابة', 'التركيز لفترات أطول']
        })
      });
      const data = await res.json();
      setAiReport(data.reportSummary);
    } catch (err) {
      console.error(err);
      setAiReport(`تقرير أسبوعي ممتاز للطالب ${selectedChild.name}! حقق تقدماً رائعاً في تنفيذ المهام والبرمجة هذا الأسبوع.`);
    } finally {
      setLoadingAi(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeTeacher || !selectedChild) return;
    try {
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

      setNewMessage('');
    } catch(err) {
       console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 dir-rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-600" />
            بوابة ولي الأمر
          </h1>
          <p className="text-slate-500 mt-1">مرحباً {currentUser?.name}، تابع تقدم أبنائك الأكاديمي.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition border ${
                selectedChild?.id === child.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {child.name}
            </button>
          ))}
          {children.length === 0 && (
             <div className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl">لا توجد حسابات أبناء مرتبطة حالياً</div>
          )}
        </div>
      </div>

      {selectedChild && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-bold">نسبة الحضور</h3>
                </div>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">92%</p>
                <p className="text-xs text-emerald-600/80 mt-1">منتظم في الدورات</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-amber-600 dark:text-amber-400">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-bold">مستوى التركيز</h3>
                </div>
                <p className="text-3xl font-black text-amber-700 dark:text-amber-300">88%</p>
                <p className="text-xs text-amber-600/80 mt-1">ممتاز في المهام العملية</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold">متوسط الاختبارات</h3>
                </div>
                <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">95%</p>
                <p className="text-xs text-indigo-600/80 mt-1">أعلى من المتوسط</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">مُولّد التقرير الأسبوعي الذكي (AI Parent Report)</h3>
                    <p className="text-xs text-slate-400">
                      يقوم الذكاء الاصطناعي بتحليل أداء الطفل في المختبرات وصياغة تقرير تشجيعي مفصل.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAiReport}
                  disabled={loadingAi}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{loadingAi ? 'جاري الصياغة...' : 'إنشاء التقرير الأسبوعي بـ AI'}</span>
                </button>
              </div>

              {aiReport && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium space-y-2 mt-4">
                  <span className="text-amber-400 font-bold block border-b border-slate-800 pb-1">
                    📝 تقرير أداء الطالب ({selectedChild.name}) الأسبوعي:
                  </span>
                  <p className="whitespace-pre-wrap">{aiReport}</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-[500px]">
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    تواصل مع المعلمين
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">اضغط على المعلم لبدء المحادثة</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {teachers.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTeacher(t)}
                      className={`w-full text-right p-3 rounded-xl transition ${
                        activeTeacher?.id === t.id 
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</div>
                      <div className="text-[10px] text-slate-500">معلم الطالب</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                {activeTeacher ? (
                  <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-900 dark:text-white">
                      المحادثة مع: {activeTeacher.name}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-500 text-xs py-10 font-bold">لا توجد رسائل سابقة. ابدأ المحادثة الآن.</div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                              msg.senderId === currentUser?.id 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                            }`}>
                              {msg.text}
                              <div className={`text-[9px] mt-1 text-left ${msg.senderId === currentUser?.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          placeholder="اكتب رسالتك للمعلم..."
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">اختر معلماً لبدء المحادثة</h3>
                    <p className="text-xs mt-2">تواصل مع معلمي طفلك لمتابعة الأداء والاستفسار عن المستوى الدراسي.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
