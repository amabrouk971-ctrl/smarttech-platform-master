import React, { useState, useEffect } from 'react';
import { HomePage } from "./pages/HomePage";
import { Header } from './components/Header';
import { ScrollProgress } from './components/navigation/ScrollProgress';
import { BackToTop } from './components/navigation/BackToTop';
import { Breadcrumbs } from './components/navigation/Breadcrumbs';

import { LearningPathsMap } from './components/LearningPathsMap';
import { LearningRoadmap } from './components/LearningRoadmap';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailModal } from './components/CourseDetailModal';
import { ScratchLab } from './components/labs/ScratchLab';
import { ArduinoCircuitLab } from './components/labs/ArduinoCircuitLab';
import { RoboticsSimulator } from './components/labs/RoboticsSimulator';
import { AiKidsLab } from './components/labs/AiKidsLab';
import { GameZone } from './components/labs/GameZone';
import { KidsDashboard } from './components/dashboards/KidsDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { BranchesSection } from './components/BranchesSection';
import { YouTubeAdBanner } from './components/YouTubeAdBanner';
import { FeaturedVideoSection } from './components/FeaturedVideoSection';
import { MarketingMediaGallery } from './components/MarketingMediaGallery';
import { StoreSection } from './components/StoreSection';
import { CertificateVerifier } from './components/CertificateVerifier';
import { SkillAssessmentModal } from './components/SkillAssessmentModal';
import { SmartBotWidget } from './components/SmartBotWidget';
import { VoiceNavigationWidget } from './components/navigation/VoiceNavigationWidget';
import { CustomerPreviewBar } from './components/CustomerPreviewBar';
import { SignInPage } from './components/auth/SignInPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { SecurityProfilePage } from './components/auth/SecurityProfilePage';
import { CustomerProfilePage } from './components/profile/CustomerProfilePage';
import { AdminCustomerProfileCMS } from './components/admin/AdminCustomerProfileCMS';
import { SmartTechCenterView } from './components/SmartTechCenterView';
import { SmartTechManagementCMS } from './components/admin/SmartTechManagementCMS';
import { AuthGateModal } from './components/AuthGateModal';
import { TeacherApplicationModal } from './components/TeacherApplicationModal';
import { SiteCustomizerModal } from './components/SiteCustomizerModal';
import { useBranding } from './context/BrandingContext';
import { useLanguage } from './context/LanguageContext';
import { StudentExamsView } from './components/student/StudentExamsView';
import { StudentProjectsView } from './components/student/StudentProjectsView';
import { FloatingXpGainToast, XpGainEvent } from './components/AnimatedXpProgress';
import { BadgeUnlockModal, Badge } from './components/BadgeUnlockModal';
import { LearningPath } from './types';
import { getPaymentSettings, DEFAULT_CONTACT_PAYMENT_SETTINGS } from './services/bookingService';
import { Course, Role, UserMode, User, XPProfile, ContactPaymentSettings } from './types';
import { getXPProfile } from './services/gamificationService';
import { subscribeToCourses, updateUserProfileInFirestore } from './services/firebaseService';
import { getLearningPathsFromFirestore } from './services/learningPathService';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { SUPER_ADMIN_EMAIL, getSpecialRoleByEmail } from './lib/permissions';
import { Code2, Zap, Bot, Sparkles } from 'lucide-react';

export function App() {
  const { settings } = useBranding();
  const { language, setLanguage, isArabic, dir, t, getLocalized } = useLanguage();
  const [currentRole, setCurrentRole] = useState<Role>(Role.STUDENT);
  const [userMode, setUserMode] = useState<UserMode>(UserMode.KIDS);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Customer Preview Mode (Admin can view platform as visitor)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Site Customizer & Logo Upload Modal
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactPaymentSettings>(DEFAULT_CONTACT_PAYMENT_SETTINGS);

  useEffect(() => {
    getPaymentSettings().then(setContactSettings).catch(console.error);
  }, []);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Auth state & Auth Modals
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authGateModalOpen, setAuthGateModalOpen] = useState(false);
  const [teacherAppModalOpen, setTeacherAppModalOpen] = useState(false);
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState<string | null>(null);

  const handleTabChange = (tabId: string) => {
    // Protected student features require login/subscription unless in preview mode
    const protectedTabs = ['labs', 'exams', 'projects', 'gamezone', 'dashboard', 'store'];
    if (protectedTabs.includes(tabId) && !currentUser && !isPreviewMode) {
      setPendingTabAfterAuth(tabId);
      setAuthGateModalOpen(true);
      return;
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    // Check redirect result on mount if redirect auth flow was triggered
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const user = result.user;
        const specialConfig = getSpecialRoleByEmail(user.email);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let appUser: User;
        if (userDoc.exists()) {
          appUser = { id: userDoc.id, ...userDoc.data() } as User;
          if (specialConfig && (appUser.role !== specialConfig.role || appUser.approvalStatus !== 'APPROVED')) {
            appUser.role = specialConfig.role;
            appUser.mode = specialConfig.mode;
            appUser.approvalStatus = specialConfig.approvalStatus;
            await updateUserProfileInFirestore(appUser);
          }
        } else {
          appUser = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'عضو سمارتك',
            email: user.email || '',
            role: specialConfig ? specialConfig.role : Role.STUDENT,
            mode: specialConfig ? specialConfig.mode : UserMode.KIDS,
            approvalStatus: specialConfig ? specialConfig.approvalStatus : 'APPROVED',
            xp: 500,
            level: 1,
            levelTitle: 'عضو سمارتك',
            badges: ['Member'],
            enrolledCourseIds: ['scratch-young-coder'],
            enrolledPathIds: ['junior-programmer']
          };
          await updateUserProfileInFirestore(appUser);
        }
        setCurrentUser(appUser);
        setCurrentRole(appUser.role);
      }
    }).catch((err) => {
      console.warn('Redirect auth result check:', err);
    });

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const specialConfig = getSpecialRoleByEmail(user.email);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            if (!userData.avatar && user.photoURL) {
              userData.avatar = user.photoURL;
            }
            if (specialConfig && (userData.role !== specialConfig.role || userData.approvalStatus !== 'APPROVED')) {
              userData.role = specialConfig.role;
              userData.mode = specialConfig.mode;
              userData.approvalStatus = specialConfig.approvalStatus;
              await updateUserProfileInFirestore(userData);
            }
            setCurrentUser(userData);
            setCurrentRole(userData.role);
            if (userData.role === Role.STUDENT) {
              setXpPoints(userData.xp || 1450);
            }
          } else {
            const defaultUser: User = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'عضو سمارتك',
              email: user.email || '',
              avatar: user.photoURL || undefined,
              role: specialConfig ? specialConfig.role : Role.STUDENT,
              mode: specialConfig ? specialConfig.mode : UserMode.KIDS,
              approvalStatus: specialConfig ? specialConfig.approvalStatus : 'APPROVED',
              xp: 500,
              level: 1,
              levelTitle: 'عضو سمارتك',
              badges: ['Member'],
              enrolledCourseIds: ['scratch-young-coder'],
              enrolledPathIds: ['junior-programmer']
            };
            await updateUserProfileInFirestore(defaultUser);
            setCurrentUser(defaultUser);
            setCurrentRole(defaultUser.role);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };


  // Gamification XP & Framer Motion XP Gain Events
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [xpProfile, setXpProfile] = useState<XPProfile | null>(null);

  useEffect(() => {
    if (currentUser) {
      getXPProfile(currentUser.id, currentUser.role).then(profile => {
        if (profile) {
          setXpProfile(profile);
          setXpPoints(profile.totalXP);
        }
      });
    } else {
      setXpProfile(null);
      setXpPoints(0);
    }
  }, [currentUser]);
  const [xpGainEvents, setXpGainEvents] = useState<XpGainEvent[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([
    'First Step Coder',
    'Circuit Explorer'
  ]);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);

  // Dynamic Courses State synced with Firebase Firestore
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Active Lab state ('scratch', 'arduino', 'robotics', 'ai')
  const [activeLabId, setActiveLabId] = useState<string>('scratch');

  // Skill Assessment Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  // Subscribe to Firestore courses & Fetch Paths
  useEffect(() => {
    const unsubscribe = subscribeToCourses((updatedCourses) => {
      setCourses(updatedCourses);
    });
    
    getLearningPathsFromFirestore().then(setLearningPaths).catch(console.error);

    return () => unsubscribe();
  }, []);

  const handleAwardXp = (amount: number, reason: string = 'إنجاز مهارة برمجية جديدة!') => {
    setXpPoints((prev) => {
      const newXp = prev + amount;
      
      // Check for milestones
      if (newXp >= 1500 && prev < 1500 && !unlockedBadges.includes('Tech Pioneer')) {
        setUnlockedBadges(b => [...b, 'Tech Pioneer']);
        setCurrentBadge({
          id: 'tech-pioneer',
          name: 'Tech Pioneer 🚀',
          description: 'You reached 1,500 XP! You are officially a Tech Pioneer, blazing trails in the digital world.',
          icon: <Sparkles className="w-12 h-12 text-white" />,
          color: 'bg-purple-500'
        });
        setBadgeModalOpen(true);
      } else if (newXp >= 2000 && prev < 2000 && !unlockedBadges.includes('Master Innovator')) {
        setUnlockedBadges(b => [...b, 'Master Innovator']);
        setCurrentBadge({
          id: 'master-innovator',
          name: 'Master Innovator ⚡',
          description: 'Unbelievable! 2,000 XP reached. Your ability to innovate and solve problems is outstanding.',
          icon: <Zap className="w-12 h-12 text-white" />,
          color: 'bg-amber-500'
        });
        setBadgeModalOpen(true);
      } else if (newXp >= 3000 && prev < 3000 && !unlockedBadges.includes('AI Wizard')) {
        setUnlockedBadges(b => [...b, 'AI Wizard']);
        setCurrentBadge({
          id: 'ai-wizard',
          name: 'AI Wizard 🤖',
          description: '3,000 XP! You have unlocked the true power of artificial intelligence. Amazing work.',
          icon: <Bot className="w-12 h-12 text-white" />,
          color: 'bg-blue-500'
        });
        setBadgeModalOpen(true);
      }

      return newXp;
    });
    const newEvent: XpGainEvent = {
      id: `xp-${Date.now()}-${Math.random()}`,
      amount,
      reason
    };
    setXpGainEvents((prev) => [...prev, newEvent]);
  };

  const handleToggleUserMode = () => {
    setUserMode((prev) => (prev === UserMode.KIDS ? UserMode.ADULT : UserMode.KIDS));
  };

  // Admin Course CRUD operations
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  return (
    <div dir={dir} className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-red-500 selection:text-white ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
      {/* Top Scroll Progress Line */}
      <ScrollProgress />

      {/* Back To Top Floating Action Button */}
      <BackToTop />

      {/* Customer Preview Mode Banner */}
      <CustomerPreviewBar
        isPreviewMode={isPreviewMode}
        onTogglePreviewMode={() => setIsPreviewMode(false)}
      />

      {/* Floating Animated XP Gains Notification Toast */}
      <FloatingXpGainToast
        events={xpGainEvents}
        onDismiss={(id) => setXpGainEvents((prev) => prev.filter((e) => e.id !== id))}
      />

      {/* Badge Unlock Modal */}
      <BadgeUnlockModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        badge={currentBadge}
      />

      {/* Render Authentication Pages if activeTab matches */}
      <>
        {activeTab === 'sign-in' && (
          <SignInPage 
            onSignInSuccess={() => {
              // The onAuthStateChanged listener handles setting currentUser
              setActiveTab(pendingTabAfterAuth || 'dashboard');
              setPendingTabAfterAuth(null);
            }}
            onNavigateToForgot={() => setActiveTab('forgot-password')}
            onNavigateToRegister={() => setActiveTab('register')} // Note: registration page would be added here
          />
        )}
        
        {activeTab === 'forgot-password' && (
          <ForgotPasswordPage onNavigateBack={() => setActiveTab('sign-in')} />
        )}

        {activeTab === 'reset-password' && (
          <ResetPasswordPage 
            oobCode={new URLSearchParams(window.location.search).get('oobCode') || ''} 
            onNavigateToSignIn={() => setActiveTab('sign-in')} 
          />
        )}

        {activeTab === 'security' && (
          <SecurityProfilePage onSignOut={() => setActiveTab('home')} />
        )}
      </>

      {/* Auth Gate Modal for Unauthenticated Guests */}
      <AuthGateModal
        isOpen={authGateModalOpen}
        onClose={() => setAuthGateModalOpen(false)}
        onOpenAuth={(preferredRole) => {
          setAuthGateModalOpen(false);
          setActiveTab('sign-in');
        }}
      />

      {/* Teacher Application Modal */}
      <TeacherApplicationModal
        isOpen={teacherAppModalOpen}
        onClose={() => setTeacherAppModalOpen(false)}
        currentUser={currentUser}
        onSubmitted={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* Header & Navigation */}
      <Header
        currentUser={currentUser}
        currentRole={isPreviewMode ? Role.STUDENT : currentRole}
        onSelectRole={setCurrentRole}
        userMode={userMode}
        onToggleUserMode={handleToggleUserMode}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        language={language}
        setLanguage={setLanguage}
        onOpenSkillAssessment={() => setSkillModalOpen(true)}
        onOpenCustomizer={() => setCustomizerModalOpen(true)}
        onOpenAuth={() => setActiveTab('sign-in')}
        onSignOut={handleSignOut}
        isPreviewMode={isPreviewMode}
        onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
        xpPoints={xpPoints}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Breadcrumb Trail */}
      <Breadcrumbs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Router */}
      <main>
        {activeTab === 'home' && (
          <HomePage
            currentUser={currentUser}
            courses={courses}
            learningPaths={learningPaths}
            onStartLearning={() => setActiveTab('courses')}
            onExplorePaths={() => setActiveTab('paths')}
            onSelectCourse={(c) => setSelectedCourseForModal(c)}
            onOpenAuth={() => setActiveTab('sign-in')}
            setActiveTab={setActiveTab}
            setActiveLabId={setActiveLabId}
          />
        )}

        {activeTab === 'roadmap' && (
          <LearningRoadmap
            courses={courses}
            currentUser={currentUser}
            onSelectCourse={(c) => setSelectedCourseForModal(c)}
          />
        )}

        {activeTab === 'paths' && (
          <>
            <LearningPathsMap
              paths={learningPaths}
              onSelectPath={() => setActiveTab('courses')}
            />
            <LearningRoadmap
              courses={courses}
              currentUser={currentUser}
              onSelectCourse={(c) => setSelectedCourseForModal(c)}
            />
          </>
        )}

        {activeTab === 'courses' && (
          <CourseCatalog
            courses={courses}
            onSelectCourse={(c) => setSelectedCourseForModal(c)}
            currentUser={currentUser}
            onOpenAuth={() => setActiveTab('sign-in')}
          />
        )}

        {activeTab === 'media' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <MarketingMediaGallery
              userRole={currentUser?.role}
              courses={courses}
              compactView={false}
            />
          </div>
        )}

        {activeTab === 'exams' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <StudentExamsView
              currentUser={currentUser}
              onAwardXp={(amt, reason) => handleAwardXp(amt, reason)}
            />
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <StudentProjectsView
              currentUser={currentUser}
              onAwardXp={(amt, reason) => handleAwardXp(amt, reason)}
            />
          </section>
        )}

        {activeTab === 'labs' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
            {/* Lab Switcher Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
              {[
                { id: 'scratch', label: 'Scratch Coding Lab 🧩' },
                { id: 'arduino', label: 'Arduino Simulator ⚡' },
                { id: 'robotics', label: 'Virtual Robotics 🤖' },
                { id: 'ai', label: 'AI Creator Lab 🧠' }
              ].map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => setActiveLabId(lab.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    activeLabId === lab.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lab.label}
                </button>
              ))}
            </div>

            {/* Active Lab Render */}
            {activeLabId === 'scratch' && <ScratchLab onAwardXp={(amt) => handleAwardXp(amt, 'إنجاز مهمة Scratch 🧩')} />}
            {activeLabId === 'arduino' && <ArduinoCircuitLab onAwardXp={(amt) => handleAwardXp(amt, 'توصيل دائرة Arduino بنجاح ⚡')} />}
            {activeLabId === 'robotics' && <RoboticsSimulator onAwardXp={(amt) => handleAwardXp(amt, 'اجتياز اختبار حلبة الروبوت 🤖')} />}
            {activeLabId === 'ai' && <AiKidsLab onAwardXp={(amt) => handleAwardXp(amt, 'تدريب نموذج رؤية AI 🧠')} />}
          </section>
        )}

        {activeTab === 'gamezone' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <GameZone onAwardXp={(amt) => handleAwardXp(amt, 'تحدي Game Zone 🎮')} />
          </section>
        )}

        {activeTab === 'store' && <StoreSection />}

        {activeTab === 'branches' && <BranchesSection />}

        {activeTab === 'verify' && <CertificateVerifier />}

        {activeTab === 'smarttech_center' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <SmartTechCenterView onNavigateTab={(tab) => setActiveTab(tab)} />

            {(currentRole === Role.ADMIN || currentRole === Role.SUPER_ADMIN) && !isPreviewMode && (
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <SmartTechManagementCMS currentUser={currentUser} />
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            <CustomerProfilePage
              currentUser={currentUser}
              onUpdateProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
              }}
            />

            {(currentRole === Role.ADMIN || currentRole === Role.SUPER_ADMIN) && !isPreviewMode && (
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <AdminCustomerProfileCMS currentUser={currentUser} />
              </div>
            )}
          </section>
        )}

        {activeTab === 'dashboard' && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {(isPreviewMode || currentRole === Role.STUDENT || currentRole === Role.ATTENDEE) && (
              <KidsDashboard
                xpPoints={xpPoints}
                unlockedBadges={unlockedBadges}
                onOpenLab={(labId) => {
                  setActiveLabId(labId);
                  setActiveTab('labs');
                }}
                studentName={currentUser?.name || 'عضو سمارتك'}
                studentId={currentUser?.id ? `ST-${currentUser.id.substring(0, 6)}` : 'ST-2026-901'}
                onAwardXp={(amt) => handleAwardXp(amt, 'مكافأة عيد الميلاد 🎂')}
              />
            )}

            {!isPreviewMode && currentRole === Role.PARENT && <ParentDashboard currentUser={currentUser} />}

            {!isPreviewMode && (currentRole === Role.TEACHER || currentRole === Role.COORDINATOR) && (
              <TeacherDashboard currentUser={currentUser} />
            )}

            {!isPreviewMode && (currentRole === Role.ADMIN || currentRole === Role.SUPER_ADMIN || currentRole === Role.EMPLOYEE) && (
              <AdminDashboard
                courses={courses}
                currentUser={currentUser}
                onUpdateCourse={handleUpdateCourse}
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
                onTogglePreviewMode={() => setIsPreviewMode(true)}
              />
            )}
          </section>
        )}
      </main>

      {/* Modal Course Detail */}
      {selectedCourseForModal && (
        <CourseDetailModal
          course={selectedCourseForModal}
          onClose={() => setSelectedCourseForModal(null)}
          currentUser={currentUser}
          onOpenAuth={() => {
            setSelectedCourseForModal(null);
            setActiveTab('sign-in');
          }}
          onAwardXp={(amt) => handleAwardXp(amt, 'حجز وتأكيد الدورة 🎯')}
        />
      )}

      {/* Skill Assessment Modal */}
      <SkillAssessmentModal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        onSelectPath={(pathId) => {
          setActiveTab('courses');
          setSkillModalOpen(false);
        }}
        onComplete={(recommendation) => {
          handleAwardXp(150, 'إكمال التقييم الذكي بـ AI 🌟');
        }}
      />

      {/* Site Customizer & Logo Upload Modal */}
      <SiteCustomizerModal
        isOpen={customizerModalOpen}
        onClose={() => setCustomizerModalOpen(false)}
      />

      {/* SmartBot Floating AI Tutor */}
      <SmartBotWidget />

      {/* Global Voice Navigation Assistant */}
      <VoiceNavigationWidget
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setActiveTab('sign-in')}
      />

      {/* Footer */}
      <footer className={`bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs ${isArabic ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={getLocalized(settings, 'brandName') || 'SmartTech Training Center'}
                  className="h-10 object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">
                  S
                </div>
              )}
              <span className="text-white font-extrabold text-lg">{getLocalized(settings, 'brandName') || 'SmartTech Training Center'}</span>
            </div>
            <p className="leading-relaxed">
              {getLocalized(settings, 'brandTagline') || t('footerAboutText')}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">{t('footerContactTitle')}</h4>
            <p>📞 الهاتف / الواتساب: {contactSettings.supportWhatsapp || contactSettings.vodafoneCashNumber || '01024434357'}</p>
            <p>📍 المقر الرئيسي: {contactSettings.centerAddress || 'الإسكندرية - زيزينيا - 603 طريق الحرية (أعلى البنك الأهلي المصري - الدور الثاني)'}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">{isArabic ? 'حقوق النشر والاعتماد:' : 'Copyrights & Accreditation:'}</h4>
            <p>{getLocalized(settings, 'footerText') || t('footerRights')}</p>
            <p className="text-red-400 font-bold">{isArabic ? 'الموقع الرسمي: https://smart-courses.org' : 'Official Website: https://smart-courses.org'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
