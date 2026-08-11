import React, { useState, useEffect } from 'react';
import {
  Code2,
  Globe,
  User as UserIcon,
  ShieldAlert, Shield,
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
  Megaphone,
  BookOpen,
  Compass,
  Cpu,
  Trophy,
  ShoppingBag,
  Award,
  ChevronDown
} from 'lucide-react';
import { Role, UserMode, User, Notification, ContactPaymentSettings } from '../types';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { useBranding } from '../context/BrandingContext';
import { NAVIGATION_ITEMS, NavItemConfig } from '../config/navigation';
import { getPaymentSettings, DEFAULT_CONTACT_PAYMENT_SETTINGS } from '../services/bookingService';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);

  useEffect(() => {
    getPaymentSettings().then(setContactSettings).catch(console.error);
  }, []);

  // Scroll position detection for transparent-to-solid glass transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notifications listener from Firestore
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
    const unsub = onSnapshot(
      q,
      (snap) => {
        const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(notifs);
      },
      (err) => console.warn('Notifications snapshot error:', err)
    );
    return () => unsub();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const isArabic = language === 'ar';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-950/5'
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Dynamic Announcement Banner */}
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
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <a
            href={`tel:${contactSettings.supportWhatsapp || contactSettings.vodafoneCashNumber || '01024434357'}`}
            className="flex items-center gap-1.5 font-bold text-red-400 hover:text-red-300 transition"
          >
            <Phone className="w-3.5 h-3.5" /> {contactSettings.supportWhatsapp || contactSettings.vodafoneCashNumber || '01024434357'}
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500" /> {contactSettings.centerAddress || 'زيزينيا - الإسكندرية (أعلى البنك الأهلي)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Skill Assessment Trigger */}
          <button
            onClick={onOpenSkillAssessment}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold transition text-[11px] cursor-pointer btn-micro"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>تحديد مستوى الطفل بـ AI</span>
          </button>

          {/* Mode Switcher: Kids vs Adult */}
          <button
            onClick={onToggleUserMode}
            className={`px-2.5 py-0.5 rounded font-bold transition text-[11px] flex items-center gap-1 cursor-pointer btn-micro ${
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
              title="تبديل المظهر (فاتح / داكن)"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-1 hover:text-white transition font-semibold text-[11px] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Navbar Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="SmartTech Home"
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
              <div className="w-10 h-10 bg-gradient-to-tr from-red-600 via-amber-600 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-slate-950 dark:text-white uppercase leading-none group-hover:text-red-600 transition-colors">
                  {settings.brandNameAr || 'SmartTech'}
                </span>
                <span className="text-[10px] font-extrabold tracking-wider text-red-600 uppercase leading-none mt-1 flex items-center gap-1">
                  <span>smart-courses.org</span>
                  <span className="bg-red-600 text-white px-1 rounded text-[9px] font-black">OFFICIAL</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto py-1">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`relative px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap btn-micro flex items-center gap-1.5 ${
                  isActive
                    ? 'text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{isArabic ? item.labelAr : item.labelEn}</span>

                {item.badgeAr && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black animate-pulse">
                    {isArabic ? item.badgeAr : item.badgeEn}
                  </span>
                )}

                {/* Animated active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar (XP, Customer Preview, Login/Profile, CTA) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Level & XP Badge */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-inner">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Lvl</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {Math.floor(xpPoints / 1000) + 1}
              </span>
            </div>
            <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">XP</span>
              <span className="text-xs font-black text-red-600 font-mono">{xpPoints}</span>
            </div>
          </div>

          {/* Customer Preview Mode Toggle */}
          {currentRole === Role.ADMIN && onTogglePreviewMode && (
            <button
              onClick={onTogglePreviewMode}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition border flex items-center gap-1 cursor-pointer btn-micro ${
                isPreviewMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{isPreviewMode ? 'إلغاء المعاينة' : 'معاينة 👁️'}</span>
            </button>
          )}

          {/* Auth Button or User Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs border transition btn-micro cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-red-600 text-white border-red-500 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                }`}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full object-cover border border-red-500" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="max-w-[90px] truncate">{currentUser.name || (isArabic ? 'ملفي الشخصي' : 'MY PROFILE')}</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition btn-micro"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isArabic ? 'تعليمي' : 'MY LEARNING'}</span>
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title={isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 cursor-pointer transition btn-micro"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition btn-micro"
              >
                <UserIcon className="w-3.5 h-3.5 text-red-600" />
                <span>{isArabic ? 'دخول' : 'LOGIN'}</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs cursor-pointer transition btn-micro shadow-sm"
              >
                <span>{isArabic ? 'تسجيل جديد' : 'REGISTER'}</span>
              </button>
            </div>
          )}

          {/* OPEN PLATFORM (app.smart-courses.org) CTA */}
          <a
            href="https://app.smart-courses.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition btn-micro border border-slate-800 dark:border-slate-200"
            title="Open Protected Learning Platform (app.smart-courses.org)"
          >
            <span>{isArabic ? 'منصة التعلم' : 'OPEN PLATFORM'}</span>
            <span className="text-[10px] text-amber-400">↗</span>
          </a>

          {/* Notifications Toggle */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer btn-micro"
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
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-right dir-rtl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">الإشعارات</h3>
                      {unreadCount > 0 && <span className="text-xs text-red-500 font-bold">{unreadCount} غير مقروء</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">لا توجد إشعارات حالياً.</div>
                      ) : (
                        notifications.map((n) => (
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
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Primary CTA Button: Start Learning */}
          <button
            onClick={() => {
              setActiveTab('courses');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition cursor-pointer flex items-center gap-1.5 btn-micro border border-red-500/30"
          >
            <span>{isArabic ? 'ابدأ التعلم وحجز كورس 🚀' : 'Start Learning 🚀'}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer btn-micro border border-slate-200 dark:border-slate-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation System */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-6 space-y-4 shadow-2xl"
          >
            {/* Mobile Category Grid */}
            <div className="grid grid-cols-2 gap-2">
              {NAVIGATION_ITEMS.map((item, index) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      if (item.id === 'home') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-start transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{isArabic ? item.labelAr : item.labelEn}</span>
                    {item.badgeAr && !isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-extrabold">
                        {isArabic ? item.badgeAr : item.badgeEn}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile CTA & Dashboard Buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('courses');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs rounded-xl shadow-md text-center"
              >
                {isArabic ? 'ابدأ التعلم وحجز كورس الآن 🚀' : 'Start Learning & Book Course 🚀'}
              </button>

              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-slate-100 font-bold text-xs rounded-xl text-center border border-slate-700"
              >
                {isArabic ? `فتح لوحة التحكم (${currentRole})` : `Open Dashboard (${currentRole})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
