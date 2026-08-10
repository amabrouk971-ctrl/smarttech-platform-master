import React, { useState, useEffect } from 'react';
import {
  Code2,
  Globe,
  User as UserIcon,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Gamepad2,
  Phone,
  MapPin,
  Menu,
  X,
  Bot,
  Sun,
  Moon,
  Bell,
  LogOut,
  Paintbrush,
  Megaphone
} from 'lucide-react';
import { Role, UserMode, User, Notification } from '../types';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface HeaderProps {
  currentUser?: User | null;
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  userMode: UserMode;
  onToggleUserMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  onOpenSkillAssessment: () => void;
  onOpenCustomizer?: () => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
  xpPoints?: number;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onSelectRole,
  userMode,
  onToggleUserMode,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenSkillAssessment,
  onOpenCustomizer,
  onOpenAuth,
  onSignOut,
  isPreviewMode = false,
  onTogglePreviewMode,
  xpPoints = 2450,
  theme = 'light',
  toggleTheme
}) => {
  const { settings } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, 'notifications'), 
      where('recipientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(notifs);
    }, (err) => console.warn('Notifications snapshot error:', err));
    return () => unsub();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home' },
    { id: 'roadmap', labelAr: 'خارطة الطريق 🚀', labelEn: 'Roadmap' },
    { id: 'paths', labelAr: 'المسارات', labelEn: 'Paths' },
    { id: 'courses', labelAr: 'الكورسات والأسعار', labelEn: 'Courses & Pricing' },
    { id: 'media', labelAr: 'الميديا والمنشورات 🎬', labelEn: 'Media & Posts' },
    { id: 'exams', labelAr: 'الامتحانات والتحديات 📝', labelEn: 'Exams & Quizzes' },
    { id: 'projects', labelAr: 'مشاريعي 📁', labelEn: 'My Projects' },
    { id: 'labs', labelAr: 'المختبرات التفاعلية', labelEn: 'Interactive Labs' },
    { id: 'gamezone', labelAr: 'Game Zone', labelEn: 'Game Zone' },
    { id: 'store', labelAr: 'متجر سمارتك', labelEn: 'Store' },
    { id: 'branches', labelAr: 'الفروع', labelEn: 'Branches' },
    { id: 'verify', labelAr: 'التحقق من الشهادات', labelEn: 'Certificates' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      {/* Dynamic Customizable Announcement Bar */}
      {settings.announcementTextAr && (
        <div
          className="text-white text-xs py-1.5 px-4 text-center font-black flex items-center justify-center gap-2 shadow-inner"
          style={{ backgroundColor: settings.announcementBgColorHex || '#dc2626' }}
        >
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>{settings.announcementTextAr}</span>
        </div>
      )}

      {/* Top Utility Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-red-400">
            <Phone className="w-3.5 h-3.5" /> 01024434357
          </span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-red-500" /> زيزينيا - الإسكندرية (أعلى البنك الأهلي)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Site Customizer & Logo Upload Trigger (Restricted to Admin/Super Admin only) */}
          {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) && onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold hover:brightness-110 transition text-[11px] cursor-pointer shadow-md"
              title="تعديل الشعار والألوان والخطوط بالموقع"
            >
              <Paintbrush className="w-3.5 h-3.5 animate-pulse" />
              <span>تعديل الشعار والألوان 🎨</span>
            </button>
          )}

          {/* Skill Assessment trigger button */}
          <button
            onClick={onOpenSkillAssessment}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold transition text-[11px] cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>تحديد مستوى الطفل بـ AI</span>
          </button>

          {/* Mode Switcher: Kids vs Adult */}
          <button
            onClick={onToggleUserMode}
            className={`px-2.5 py-0.5 rounded font-bold transition text-[11px] flex items-center gap-1 cursor-pointer ${
              userMode === 'KIDS'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {userMode === 'KIDS' ? (
              <>
                <Gamepad2 className="w-3.5 h-3.5 text-amber-300" /> Kids Mode 🎮
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Adult Mode 🎓
              </>
            )}
          </button>

          {/* Theme Toggle */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 hover:text-white transition font-semibold text-[11px] cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-300" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 hover:text-white transition font-semibold text-[11px] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Dynamic Logo Section */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.brandNameAr}
              style={{ height: `${settings.logoHeightPx || 42}px` }}
              className="object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
                <div className="w-5 h-5 border-4 border-white rounded-full border-t-transparent"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
                  {settings.brandNameAr || 'SmartTech'}
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] text-red-600 uppercase leading-none mt-1">
                  {settings.brandTaglineAr || 'Academy & Labs'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeTab === link.id
                  ? 'text-red-600 bg-red-50 dark:bg-red-950/40 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? link.labelAr : link.labelEn}
            </button>
          ))}
        </nav>

        {/* Right Side Actions: Gamification Level & XP Badge + Role Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Level</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {Math.floor(xpPoints / 1000) + 1}
              </span>
            </div>
            <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">XP</span>
              <span className="text-xs font-black text-red-600 font-mono">{xpPoints}</span>
            </div>
          </div>

          {currentRole === Role.ADMIN && onTogglePreviewMode && (
            <button
              onClick={onTogglePreviewMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 cursor-pointer ${
                isPreviewMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{isPreviewMode ? 'إلغاء المعاينة' : 'معاينة كعميل 👁️'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-amber-500 font-black px-1.5 py-0.5 rounded bg-amber-500/10">
                  {currentUser.role === Role.SUPER_ADMIN ? 'مشرف عام' : currentUser.role === Role.ADMIN ? 'مدير' : currentUser.role === Role.COORDINATOR ? 'منسق' : currentUser.role === Role.TEACHER ? 'معلم' : currentUser.role === Role.ATTENDEE ? 'حاضر ورشة' : currentUser.role === Role.PARENT ? 'ولي أمر' : 'طالب'}
                </span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="تسجيل الخروج"
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition"
            >
              <UserIcon className="w-3.5 h-3.5 text-red-600" />
              <span>تسجيل الدخول عبر Google / Gmail</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-right dir-rtl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">الإشعارات</h3>
                      {unreadCount > 0 && <span className="text-xs text-red-500 font-bold">{unreadCount} غير مقروء</span>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">لا توجد إشعارات حالياً.</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`p-4 border-b border-slate-100 dark:border-slate-800 transition cursor-pointer ${
                              !n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              {n.type === 'ALERT' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                              {n.type === 'MESSAGE' && <Bot className="w-4 h-4 text-blue-500" />}
                              {n.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.body}</p>
                            <div className="text-[10px] text-slate-400 mt-2">
                              {new Date(n.createdAt).toLocaleDateString('ar-EG')} - {new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setActiveTab('courses')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-md shadow-red-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>حجز كورس الآن 🚀</span>
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold text-right ${
                  activeTab === link.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {language === 'ar' ? link.labelAr : link.labelEn}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl text-center"
            >
              فتح لوحة التحكم ({currentRole})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
