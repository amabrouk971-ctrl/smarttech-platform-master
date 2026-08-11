import { User, Role, DataScope, UserMode, ApprovalStatus } from '../types';

export const SUPER_ADMIN_EMAIL = 'amabrouk971@gmail.com';
export const COORDINATOR_EMAIL = 'smarttechcenter2020@gmail.com';

export interface SpecialRoleConfig {
  role: Role;
  mode: UserMode;
  approvalStatus: ApprovalStatus;
}

export function getSpecialRoleByEmail(email: string | null | undefined): SpecialRoleConfig | null {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return {
      role: Role.SUPER_ADMIN,
      mode: UserMode.ADULT,
      approvalStatus: 'APPROVED'
    };
  }
  if (clean === COORDINATOR_EMAIL.toLowerCase()) {
    return {
      role: Role.COORDINATOR,
      mode: UserMode.ADULT,
      approvalStatus: 'APPROVED'
    };
  }
  return null;
}

export const ALL_PERMISSIONS = [
  // Students
  'students.view',
  'students.create',
  'students.edit',
  'students.delete',
  'students.approve',
  // Parents
  'parents.view',
  'parents.create',
  'parents.edit',
  'parents.delete',
  // Teachers
  'teachers.view',
  'teachers.approve',
  'teachers.edit',
  'teachers.suspend',
  // Courses
  'courses.view',
  'courses.create',
  'courses.edit',
  'courses.delete',
  'courses.publish',
  // Attendance & QR
  'attendance.view',
  'attendance.create',
  'attendance.edit',
  'attendance.delete',
  'attendance.scan_qr',
  // Exams
  'exams.view',
  'exams.create',
  'exams.edit',
  'exams.grade',
  // Labs
  'labs.view',
  'labs.manage',
  // Messages
  'messages.view',
  'messages.send',
  // Reports & Analytics
  'reports.view',
  'reports.export',
  // Management & Security
  'users.manage',
  'roles.manage',
  'permissions.manage',
  'settings.manage',
  'audit_logs.view',
  // Profile & Documents Permissions
  'profile.view',
  'profile.edit',
  'profile.view_contact',
  'profile.view_education',
  'profile.view_certificates',
  'documents.view_private',
  'documents.view_identity',
  'documents.edit',
  'documents.verify',
  'documents.delete'
] as const;

export type PermissionKey = typeof ALL_PERMISSIONS[number];

export const ALL_PAGES = [
  { id: 'dashboard', labelAr: 'لوحة التحكم الرئيسي', labelEn: 'Dashboard' },
  { id: 'students', labelAr: 'إدارة الطلاب', labelEn: 'Students' },
  { id: 'parents', labelAr: 'أولياء الأمور', labelEn: 'Parents' },
  { id: 'teachers', labelAr: 'المعلمون والمدربون', labelEn: 'Teachers' },
  { id: 'courses', labelAr: 'الكورسات والمسارات', labelEn: 'Courses' },
  { id: 'groups', labelAr: 'المجموعات والفصول', labelEn: 'Groups' },
  { id: 'sessions', labelAr: 'الجلسات والحضور', labelEn: 'Sessions' },
  { id: 'attendance', labelAr: 'سجل الحضور', labelEn: 'Attendance' },
  { id: 'qr_scanner', labelAr: 'ماسح QR الحضور', labelEn: 'QR Scanner' },
  { id: 'exams', labelAr: 'الامتحانات والتقييمات', labelEn: 'Exams' },
  { id: 'assignments', labelAr: 'الواجبات والتكليفات', labelEn: 'Assignments' },
  { id: 'labs', labelAr: 'المختبرات التفاعلية', labelEn: 'Interactive Labs' },
  { id: 'messages', labelAr: 'الرسائل والدعم', labelEn: 'Messages' },
  { id: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications' },
  { id: 'reports', labelAr: 'التقارير والإحصائيات', labelEn: 'Reports' },
  { id: 'payments', labelAr: 'المالية والاشتراكات', labelEn: 'Payments' },
  { id: 'crm', labelAr: 'إدارة العلاقات CRM', labelEn: 'CRM' },
  { id: 'approvals', labelAr: 'طلبات الموافقة والتسجيل', labelEn: 'Pending Approvals' },
  { id: 'settings', labelAr: 'إعدادات المنصة', labelEn: 'Settings' },
  { id: 'users', labelAr: 'إدارة المستخدمين', labelEn: 'Users' },
  { id: 'roles', labelAr: 'الأدوار والتراخيص', labelEn: 'Roles & Permissions' },
  { id: 'audit_logs', labelAr: 'سجلات التدقيق والأمان', labelEn: 'Audit Logs' }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, { permissions: string[]; pages: string[]; scope: DataScope }> = {
  [Role.SUPER_ADMIN]: {
    permissions: Array.from(ALL_PERMISSIONS),
    pages: ALL_PAGES.map(p => p.id),
    scope: 'ALL'
  },
  [Role.ADMIN]: {
    permissions: [
      'students.view', 'students.create', 'students.edit', 'students.approve',
      'parents.view', 'parents.create', 'parents.edit',
      'teachers.view', 'teachers.edit', 'teachers.approve',
      'courses.view', 'courses.create', 'courses.edit', 'courses.publish',
      'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.scan_qr',
      'exams.view', 'exams.create', 'exams.edit', 'exams.grade',
      'labs.view', 'labs.manage',
      'messages.view', 'messages.send',
      'reports.view', 'reports.export',
      'users.manage', 'roles.manage', 'permissions.manage', 'settings.manage', 'audit_logs.view'
    ],
    pages: [
      'dashboard', 'students', 'parents', 'teachers', 'courses', 'groups', 'sessions',
      'attendance', 'qr_scanner', 'exams', 'assignments', 'labs', 'messages', 'notifications',
      'reports', 'approvals', 'users', 'roles', 'permissions', 'audit_logs'
    ],
    scope: 'ALL'
  },
  [Role.COORDINATOR]: {
    permissions: [
      'students.view', 'students.create', 'students.edit', 'students.approve',
      'parents.view', 'parents.create',
      'teachers.view',
      'courses.view',
      'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.scan_qr',
      'exams.view',
      'labs.view',
      'messages.view', 'messages.send',
      'reports.view'
    ],
    pages: [
      'dashboard', 'students', 'parents', 'teachers', 'courses', 'groups', 'sessions',
      'attendance', 'qr_scanner', 'exams', 'assignments', 'labs', 'messages', 'notifications', 'reports', 'approvals'
    ],
    scope: 'BRANCH'
  },
  [Role.EMPLOYEE]: {
    permissions: [
      'students.view', 'students.create', 'students.edit',
      'parents.view', 'parents.create',
      'courses.view',
      'attendance.view', 'attendance.create', 'attendance.scan_qr',
      'exams.view',
      'messages.view', 'messages.send',
      'crm.manage'
    ],
    pages: [
      'dashboard', 'students', 'parents', 'courses', 'groups', 'sessions',
      'attendance', 'qr_scanner', 'messages', 'notifications', 'crm'
    ],
    scope: 'BRANCH'
  },
  [Role.TEACHER]: {
    permissions: [
      'students.view',
      'courses.view',
      'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.scan_qr',
      'exams.view', 'exams.create', 'exams.edit', 'exams.grade',
      'labs.view',
      'messages.view', 'messages.send',
      'reports.view'
    ],
    pages: [
      'dashboard', 'students', 'courses', 'groups', 'sessions', 'attendance',
      'qr_scanner', 'exams', 'assignments', 'labs', 'messages', 'notifications', 'reports'
    ],
    scope: 'ASSIGNED_STUDENTS'
  },
  [Role.STUDENT]: {
    permissions: [
      'courses.view',
      'attendance.view',
      'exams.view',
      'labs.view',
      'messages.view', 'messages.send'
    ],
    pages: [
      'dashboard', 'courses', 'attendance', 'exams', 'assignments', 'labs', 'messages', 'notifications'
    ],
    scope: 'OWN_DATA'
  },
  [Role.ATTENDEE]: {
    permissions: [
      'courses.view',
      'attendance.view',
      'labs.view',
      'messages.view', 'messages.send'
    ],
    pages: [
      'dashboard', 'courses', 'attendance', 'labs', 'messages', 'notifications'
    ],
    scope: 'OWN_DATA'
  },
  [Role.PARENT]: {
    permissions: [
      'students.view',
      'courses.view',
      'attendance.view',
      'exams.view',
      'messages.view', 'messages.send',
      'reports.view'
    ],
    pages: [
      'dashboard', 'students', 'courses', 'attendance', 'exams', 'messages', 'notifications', 'reports'
    ],
    scope: 'LINKED_CHILDREN'
  },
  [Role.GUEST]: {
    permissions: [
      'courses.view'
    ],
    pages: [
      'courses'
    ],
    scope: 'OWN_DATA'
  }
};

export function getRoleLabelAr(role: Role | string): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return 'المشرف العام (Super Administrator)';
    case Role.ADMIN:
      return 'مدير النظام (Administrator)';
    case Role.COORDINATOR:
      return 'منسق الفروع والأكاديميات (Coordinator)';
    case Role.TEACHER:
      return 'مدرب / معلم معتمد (Instructor)';
    case Role.STUDENT:
      return 'طالب أكاديمي (Academic Student)';
    case Role.ATTENDEE:
      return 'حاضر / متدرب ورش عمل (Attendee)';
    case Role.PARENT:
      return 'ولي أمر (Parent / Guardian)';
    case Role.GUEST:
      return 'زائر (Guest)';
    default:
      return role;
  }
}

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === Role.SUPER_ADMIN || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export function isCoordinator(user: User | null): boolean {
  if (!user) return false;
  return user.role === Role.COORDINATOR || user.email?.toLowerCase() === COORDINATOR_EMAIL.toLowerCase();
}

export function hasPermission(user: User | null, permission: PermissionKey | string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  // Check specific user permission override
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  // Check role permissions
  const roleConfig = DEFAULT_ROLE_PERMISSIONS[user.role];
  if (roleConfig && roleConfig.permissions.includes(permission)) {
    return true;
  }

  return false;
}

export function canAccessPage(user: User | null, pageId: string): boolean {
  if (!user) {
    // Guest access allowed for public catalog/courses page
    return pageId === 'courses' || pageId === 'home';
  }
  if (isSuperAdmin(user)) return true;

  // Check custom user page permissions override
  if (user.pagePermissions && user.pagePermissions.length > 0) {
    return user.pagePermissions.includes(pageId);
  }

  // Check default role pages
  const roleConfig = DEFAULT_ROLE_PERMISSIONS[user.role];
  if (roleConfig && roleConfig.pages.includes(pageId)) {
    return true;
  }

  return false;
}
