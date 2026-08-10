import React, { useState } from 'react';
import { Course, User } from '../../types';
import { Menu, Search, Bell, LogOut, ChevronRight } from 'lucide-react';
import { Sidebar, AdminCategory } from '../admin/Sidebar';

// Module Imports
import { AdminSettingsCMS } from '../admin/AdminSettingsCMS';
import { AuthenticationSettingsCMS } from '../admin/AuthenticationSettingsCMS';
import { AdminUsersCMS } from '../admin/AdminUsersCMS';
import { StoreCMS } from '../admin/StoreCMS';
import { CertificatesCMS } from '../admin/CertificatesCMS';
import { EnrollmentsCMS } from '../admin/EnrollmentsCMS';
import { OffersCMS } from '../admin/OffersCMS';
import { EmailCampaignsCMS } from '../admin/EmailCampaignsCMS';
import { AdminSupportCMS } from '../admin/AdminSupportCMS';
import { QrAttendanceScanner } from '../admin/QrAttendanceScanner';
import { LearningPathBuilderCMS } from '../admin/LearningPathBuilderCMS';
import { LabBuilderCMS } from '../admin/LabBuilderCMS';
import { AdminCoursesCMS } from '../admin/AdminCoursesCMS';
import { CourseClassesCMS } from '../admin/CourseClassesCMS';
import { CourseCurriculumCMS } from '../admin/CourseCurriculumCMS';
import { AdminDiscoveryCMS } from '../admin/AdminDiscoveryCMS';
import { AdminBookingsCMS } from '../admin/AdminBookingsCMS';
import { AdminPaymentSettingsCMS } from '../admin/AdminPaymentSettingsCMS';
import { ExportCenterCMS } from '../admin/ExportCenterCMS';
import { RevenueDashboardCMS } from '../admin/RevenueDashboardCMS';
import { LeadManagerCMS } from '../admin/LeadManagerCMS';
import { GamificationCMS } from '../admin/GamificationCMS';
import { AcademyMembershipCMS } from '../admin/AcademyMembershipCMS';
import { ApprovalDashboardCMS } from '../admin/ApprovalDashboardCMS';
import { PermissionManagerCMS } from '../admin/PermissionManagerCMS';
import { AuditLogsCMS } from '../admin/AuditLogsCMS';
import { ExamCMS } from '../admin/ExamCMS';
import { AssignmentCMS } from '../admin/AssignmentCMS';
import { AnnouncementCMS } from '../admin/AnnouncementCMS';
import { MaterialCMS } from '../admin/MaterialCMS';
import { SimulationBuilderCMS } from '../admin/SimulationBuilderCMS';
import { AdminProjectsCMS } from '../admin/AdminProjectsCMS';
import { RelationshipsCMS } from '../admin/RelationshipsCMS';
import { AutomationCMS } from '../admin/AutomationCMS';
import { EmployeeManagerCMS } from '../admin/EmployeeManagerCMS';
import { EmployeePerformance } from '../admin/EmployeePerformance';
import { ContentStudioCMS } from '../admin/ContentStudioCMS';

// Missing standard views - placeholder components or custom renders can be added
// For 'Courses', we need to display a course list or use an existing Course CMS if any. 
// The original used the main App's state for courses. We'll use a placeholder for now, 
// but wait, we need to let the admin edit courses. In the original, the courses were rendered directly in AdminDashboard.

interface AdminDashboardProps {
  courses: Course[];
  currentUser?: User | null;
  onUpdateCourse: (updated: Course) => void;
  onAddCourse: (newCourse: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onTogglePreviewMode?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  currentUser,
  onUpdateCourse,
  onAddCourse,
  onDeleteCourse,
  onTogglePreviewMode
}) => {
  const [activeCategory, setActiveCategory] = useState<AdminCategory>('DASHBOARD');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // We map categories to their available sub-tabs
  const getSubTabs = (category: AdminCategory) => {
    switch (category) {
      case 'DASHBOARD': return [{ id: 'overview', label: 'Platform Overview' }];
      case 'PEOPLE': return [
        { id: 'users', label: 'All Users' },
        { id: 'employees', label: 'Employees' },
        { id: 'memberships', label: 'Memberships' },
        { id: 'approvals', label: 'Approvals' }
      ];
      case 'ACADEMIC': return [
        { id: 'courses', label: 'Courses' },
        { id: 'classes', label: 'Classes & Schedules' },
        { id: 'curriculum', label: 'Curriculum' },
        { id: 'learningPaths', label: 'Learning Paths' },
        { id: 'exams', label: 'Exams' },
        { id: 'projects', label: 'Projects' },
        { id: 'labs', label: 'Interactive Labs' },
        { id: 'simulations', label: 'Simulations' },
        { id: 'certificates', label: 'Certificates' }
      ];
      case 'STUDENT_MANAGEMENT': return [
        { id: 'attendance', label: 'QR Attendance' },
        { id: 'enrollments', label: 'Enrollments' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'materials', label: 'Materials' }
      ];
      case 'CONTENT': return [
        { id: 'studio', label: 'Content Studio' },
        { id: 'announcements', label: 'Announcements' }
      ];
      case 'STORE': return [
        { id: 'store', label: 'Store Management' },
        { id: 'offers', label: 'Offers' }
      ];
      case 'CRM': return [
        { id: 'leads', label: 'Leads' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'relationships', label: 'Parent Relationships' },
        { id: 'support', label: 'Support & Bugs' }
      ];
      case 'COMMUNICATION': return [
        { id: 'email', label: 'Email Campaigns' },
        { id: 'automations', label: 'Automations' }
      ];
      case 'ANALYTICS': return [
        { id: 'revenue', label: 'Revenue' },
        { id: 'performance', label: 'Employee Performance' },
        { id: 'gamification', label: 'Gamification' }
      ];
      case 'SECURITY': return [
        { id: 'permissions', label: 'Permissions' },
        { id: 'audit', label: 'Audit Logs' }
      ];
      case 'SETTINGS': return [
        { id: 'general', label: 'General Settings' },
        { id: 'auth', label: 'Authentication' },
        { id: 'payments', label: 'Payment Settings' },
        { id: 'discovery', label: 'Discovery Engine' },
        { id: 'exports', label: 'Data Exports' }
      ];
      default: return [];
    }
  };

  const subTabs = getSubTabs(activeCategory);

  // Auto-select first sub-tab when category changes
  React.useEffect(() => {
    if (subTabs.length > 0 && !subTabs.find(t => t.id === activeSubTab)) {
      setActiveSubTab(subTabs[0].id);
    }
  }, [activeCategory, subTabs, activeSubTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" dir="ltr">
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Admin</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 dark:text-white capitalize">{activeCategory.toLowerCase().replace('_', ' ')}</span>
              {activeSubTab && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-red-500">{subTabs.find(t => t.id === activeSubTab)?.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onTogglePreviewMode && (
              <button 
                onClick={onTogglePreviewMode}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                Exit Admin
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Sub-Navigation */}
        {subTabs.length > 1 && (
          <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 overflow-x-auto">
            <div className="flex items-center gap-6">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`
                    py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors
                    ${activeSubTab === tab.id 
                      ? 'border-red-500 text-red-500' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Render Modules Based on Sub Tab */}
            {activeCategory === 'DASHBOARD' && activeSubTab === 'overview' && (
              <div className="text-center py-12 text-slate-500">Dashboard Overview Coming Soon</div>
            )}

            {/* People */}
            {activeCategory === 'PEOPLE' && activeSubTab === 'users' && <AdminUsersCMS />}
            {activeCategory === 'PEOPLE' && activeSubTab === 'employees' && <EmployeeManagerCMS />}
            {activeCategory === 'PEOPLE' && activeSubTab === 'memberships' && <AcademyMembershipCMS />}
            {activeCategory === 'PEOPLE' && activeSubTab === 'approvals' && <ApprovalDashboardCMS />}

            {/* Academic */}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'courses' && <AdminCoursesCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'classes' && <CourseClassesCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'curriculum' && <CourseCurriculumCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'learningPaths' && <LearningPathBuilderCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'exams' && <ExamCMS />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'projects' && <AdminProjectsCMS />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'labs' && <LabBuilderCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'simulations' && <SimulationBuilderCMS courses={courses} />}
            {activeCategory === 'ACADEMIC' && activeSubTab === 'certificates' && <CertificatesCMS courses={courses} />}

            {/* Student Management */}
            {activeCategory === 'STUDENT_MANAGEMENT' && activeSubTab === 'attendance' && <QrAttendanceScanner courses={courses} />}
            {activeCategory === 'STUDENT_MANAGEMENT' && activeSubTab === 'enrollments' && <EnrollmentsCMS courses={courses} />}
            {activeCategory === 'STUDENT_MANAGEMENT' && activeSubTab === 'assignments' && <AssignmentCMS />}
            {activeCategory === 'STUDENT_MANAGEMENT' && activeSubTab === 'materials' && <MaterialCMS />}

            {/* Content */}
            {activeCategory === 'CONTENT' && activeSubTab === 'studio' && <ContentStudioCMS />}
            {activeCategory === 'CONTENT' && activeSubTab === 'announcements' && <AnnouncementCMS />}

            {/* Store */}
            {activeCategory === 'STORE' && activeSubTab === 'store' && <StoreCMS />}
            {activeCategory === 'STORE' && activeSubTab === 'offers' && <OffersCMS courses={courses} />}

            {/* CRM */}
            {activeCategory === 'CRM' && activeSubTab === 'leads' && <LeadManagerCMS />}
            {activeCategory === 'CRM' && activeSubTab === 'bookings' && <AdminBookingsCMS currentUser={currentUser || undefined} />}
            {activeCategory === 'CRM' && activeSubTab === 'relationships' && <RelationshipsCMS />}
            {activeCategory === 'CRM' && activeSubTab === 'support' && <AdminSupportCMS />}

            {/* Communication */}
            {activeCategory === 'COMMUNICATION' && activeSubTab === 'email' && <EmailCampaignsCMS />}
            {activeCategory === 'COMMUNICATION' && activeSubTab === 'automations' && <AutomationCMS />}

            {/* Analytics */}
            {activeCategory === 'ANALYTICS' && activeSubTab === 'revenue' && <RevenueDashboardCMS />}
            {activeCategory === 'ANALYTICS' && activeSubTab === 'performance' && currentUser && <EmployeePerformance currentUser={currentUser} />}
            {activeCategory === 'ANALYTICS' && activeSubTab === 'gamification' && <GamificationCMS />}

            {/* Security */}
            {activeCategory === 'SECURITY' && activeSubTab === 'permissions' && <PermissionManagerCMS />}
            {activeCategory === 'SECURITY' && activeSubTab === 'audit' && <AuditLogsCMS />}

            {/* Settings */}
            {activeCategory === 'SETTINGS' && activeSubTab === 'general' && <AdminSettingsCMS currentUser={currentUser || undefined} />}
            {activeCategory === 'SETTINGS' && activeSubTab === 'auth' && <AuthenticationSettingsCMS />}
            {activeCategory === 'SETTINGS' && activeSubTab === 'payments' && <AdminPaymentSettingsCMS />}
            {activeCategory === 'SETTINGS' && activeSubTab === 'discovery' && <AdminDiscoveryCMS />}
            {activeCategory === 'SETTINGS' && activeSubTab === 'exports' && <ExportCenterCMS />}

          </div>
        </main>
      </div>
    </div>
  );
};
