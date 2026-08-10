import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Employee, EmployeeRole, EmployeeStatus, User, Role, UserMode } from '../types';
import { logAuditEventInFirestore, updateUserProfileInFirestore } from './firebaseService';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    employeeId: 'EMP-1001',
    fullName: 'خديجة محمد (Khadija)',
    email: 'khadija@smarttech.edu',
    phone: '01011112233',
    whatsappNumber: '01011112233',
    jobTitle: 'مسؤولة مبيعات ومنسقة كورسات',
    department: 'المبيعات وخدمة العملاء',
    branch: 'الفرع الرئيسي (القاهرة)',
    role: 'COORDINATOR',
    status: 'ACTIVE',
    permissions: [
      'leads.view', 'leads.create', 'leads.edit', 'leads.assign',
      'leads.call_log', 'leads.message_log', 'leads.followup',
      'leads.convert', 'courses.view', 'enrollments.create'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-1002',
    employeeId: 'EMP-1002',
    fullName: 'مهيتاب علي (Mehitab)',
    email: 'mehitab@smarttech.edu',
    phone: '01022223344',
    whatsappNumber: '01022223344',
    jobTitle: 'مبيعات وتسجيل طلاب',
    department: 'المبيعات وخدمة العملاء',
    branch: 'الفرع الرئيسي (القاهرة)',
    role: 'SALES',
    status: 'ACTIVE',
    permissions: [
      'leads.view', 'leads.create', 'leads.edit',
      'leads.call_log', 'leads.message_log', 'leads.followup',
      'leads.convert', 'courses.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'EMP-1003',
    employeeId: 'EMP-1003',
    fullName: 'حبيبة حسن (Habiba)',
    email: 'habiba@smarttech.edu',
    phone: '01033334455',
    whatsappNumber: '01033334455',
    jobTitle: 'منسقة الأكاديمية والقبول',
    department: 'شؤون الطلاب والقبول',
    branch: 'الفرع الرئيسي (القاهرة)',
    role: 'COORDINATOR',
    status: 'ACTIVE',
    permissions: [
      'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'leads.reassign',
      'leads.call_log', 'leads.message_log', 'leads.followup',
      'leads.convert', 'courses.view', 'enrollments.create', 'payments.view'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const fetchEmployeesFromFirestore = async (): Promise<Employee[]> => {
  try {
    const col = collection(db, 'employees');
    const snapshot = await getDocs(col);
    
    if (snapshot.empty) {
      // Seed initial employees in Firestore
      console.log('Seeding initial employees into Firestore...');
      for (const emp of INITIAL_EMPLOYEES) {
        await setDoc(doc(db, 'employees', emp.id), emp);

        // Also seed user account profile for Firebase Auth login link
        const userProf: User = {
          id: emp.id,
          name: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          role: emp.role === 'ADMIN' ? Role.ADMIN : Role.COORDINATOR,
          mode: UserMode.ADULT,
          approvalStatus: 'APPROVED',
          xp: 1000,
          level: 2,
          levelTitle: emp.jobTitle,
          badges: ['SmartTech Team', emp.role],
          enrolledCourseIds: [],
          enrolledPathIds: []
        };
        await updateUserProfileInFirestore(userProf);
      }
      return INITIAL_EMPLOYEES;
    }

    const list: Employee[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Employee));
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
  } catch (err) {
    console.error('Error fetching employees from Firestore:', err);
    return INITIAL_EMPLOYEES;
  }
};

export const createEmployeeInFirestore = async (
  input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser?: { id: string; name: string }
): Promise<Employee> => {
  const empId = input.employeeId || `EMP-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const newEmp: Employee = {
    ...input,
    id: empId,
    employeeId: empId,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'employees', empId), newEmp);

  // Sync user profile record
  const userProfile: User = {
    id: empId,
    name: newEmp.fullName,
    email: newEmp.email,
    phone: newEmp.phone,
    role: newEmp.role === 'ADMIN' ? Role.ADMIN : Role.COORDINATOR,
    mode: UserMode.ADULT,
    approvalStatus: 'APPROVED',
    xp: 500,
    level: 1,
    levelTitle: newEmp.jobTitle,
    badges: ['Employee', newEmp.department],
    enrolledCourseIds: [],
    enrolledPathIds: []
  };
  await updateUserProfileInFirestore(userProfile);

  if (adminUser) {
    await logAuditEventInFirestore({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: `إضافة موظف جديد: ${newEmp.fullName} (${empId})`,
      targetType: 'USER',
      targetId: empId,
      details: newEmp
    });
  }

  return newEmp;
};

export const updateEmployeeInFirestore = async (
  employeeId: string,
  updateFields: Partial<Employee>,
  adminUser?: { id: string; name: string }
): Promise<void> => {
  try {
    const empRef = doc(db, 'employees', employeeId);
    await updateDoc(empRef, {
      ...updateFields,
      updatedAt: new Date().toISOString()
    });

    if (adminUser) {
      await logAuditEventInFirestore({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: `تحديث بيانات الموظف (${employeeId})`,
        targetType: 'USER',
        targetId: employeeId,
        details: updateFields
      });
    }
  } catch (err) {
    console.error('Error updating employee in Firestore:', err);
  }
};

export const updateEmployeeStatusInFirestore = async (
  employeeId: string,
  status: EmployeeStatus,
  adminUser?: { id: string; name: string }
): Promise<void> => {
  await updateEmployeeInFirestore(employeeId, { status }, adminUser);
};
