import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, Volume2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartBotWidgetProps {
  currentProblemTitle?: string;
  currentCodeOrCircuit?: string;
}

export const SmartBotWidget: React.FC<SmartBotWidgetProps> = ({
  currentProblemTitle = 'كيف تبني أول لعبة بـ Scratch؟',
  currentCodeOrCircuit = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: 'bot' | 'user'; text: string; hints?: string[] }[]
  >([
    {
      sender: 'bot',
      text: 'أهلاً يا بطل! أنا SmartBot، مساعدك الذكي في سمارتك! 🤖✨ كيف يمكنني مساعدتك اليوم؟'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/smartbot-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: currentProblemTitle || textToSend,
          currentCode: currentCodeOrCircuit,
          studentAttempts: 1
        })
      });

      const data = await response.json();
      const hints: string[] = data.hints || [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'إليك إرشادات خطوة بخطوة لمساعدتك في التفكير بدون إعطائك الحل النهائي مباشرةً! 💡',
          hints
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'لا تقلق! راجع خطوات الكود وتأكد من ترتيب الحلقات والشرط المناسب.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskForHint = () => {
    handleSend('أحتاج مساعدة وإرشاد في هذه المهمة من فضلك!');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white shadow-2xl shadow-red-500/40 border-2 border-white/20 font-bold text-sm tracking-wide cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-7 h-7 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-red-600 animate-ping" />
          </div>
          <span className="hidden sm:inline">مساعد سمارتك AI</span>
        </motion.button>
      </div>

      {/* Floating Dialog Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[580px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden dir-rtl text-right"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">SmartBot AI Tutor</h3>
                  <p className="text-xs text-red-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> موجهك التعليمي الذكي
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Hint Quick Trigger Bar */}
            <div className="bg-red-50 dark:bg-slate-800/60 p-2.5 px-4 border-b border-red-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[220px]">
                🎯 المهمة الحالية: {currentProblemTitle}
              </span>
              <button
                onClick={handleAskForHint}
                disabled={loading}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold flex items-center gap-1 text-xs shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> احصل على Hint
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[360px] bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-red-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none shadow border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Step-by-step Hints rendering */}
                    {msg.hints && msg.hints.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                        {msg.hints.map((hint, hIdx) => (
                          <div
                            key={hIdx}
                            className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
                          >
                            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold text-[10px]">
                              Hint {hIdx + 1}
                            </span>
                            <span>{hint}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-white dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                  <Bot className="w-4 h-4 text-red-600 animate-spin" />
                  <span>SmartBot يفكر في توجيه ذكي لك...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل SmartBot عن خطوة أو خطأ في الكود..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
