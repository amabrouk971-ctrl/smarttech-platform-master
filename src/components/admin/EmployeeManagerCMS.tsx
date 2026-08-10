import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, CheckCircle, AlertCircle, RefreshCw, Edit3, Lock, Power, UserCheck, Phone, Mail, Building, Briefcase } from 'lucide-react';
import { Employee, EmployeeRole, EmployeeStatus, User } from '../../types';
import { fetchEmployeesFromFirestore, createEmployeeInFirestore, updateEmployeeInFirestore, updateEmployeeStatusInFirestore } from '../../services/employeeService';
import { fetchLeadsFromFirestore } from '../../services/leadService';

interface EmployeeManagerCMSProps {
  currentUser?: User | null;
}

const ALL_PERMISSIONS = [
  { key: 'leads.view', label: 'عرض الليدز' },
  { key: 'leads.create', label: 'إنشاء ليد جديد' },
  { key: 'leads.edit', label: 'تعديل بيانات الليد' },
  { key: 'leads.assign', label: 'تعيين الليد لموظف' },
  { key: 'leads.reassign', label: 'إعادة تحويل الليد' },
  { key: 'leads.delete', label: 'حذف الليد' },
  { key: 'leads.call_log', label: 'تسجيل مكالمات' },
  { key: 'leads.message_log', label: 'تسجيل رسائل' },
  { key: 'leads.followup', label: 'إدارة المتابعات' },
  { key: 'leads.convert', label: 'تحويل لعضوية أكاديمية' },
  { key: 'employees.view', label: 'عرض الموظفين' },
  { key: 'employees.manage', label: 'إدارة وتعديل الموظفين' },
  { key: 'courses.view', label: 'عرض الكورسات' },
  { key: 'enrollments.create', label: 'إنشاء اشتراكات' },
  { key: 'payments.view', label: 'عرض المالية والإيرادات' },
  { key: 'reports.view', label: 'عرض التقارير والتحليلات' }
];

export const EmployeeManagerCMS: React.FC<EmployeeManagerCMSProps> = ({ currentUser }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Performance stats map per employee
  const [employeeStats, setEmployeeStats] = useState<Record<string, { totalLeads: number; enrolled: number; conversionRate: number }>>({});

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    jobTitle: 'مسؤول مبيعات ومنسق',
    department: 'المبيعات وخدمة العملاء',
    branch: 'الفرع الرئيسي (القاهرة)',
    role: 'COORDINATOR' as EmployeeRole,
    status: 'ACTIVE' as EmployeeStatus,
    permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.call_log', 'leads.message_log', 'leads.followup', 'leads.convert', 'courses.view']
  });

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const empList = await fetchEmployeesFromFirestore();
    const leadsList = await fetchLeadsFromFirestore();

    // Calculate performance per employee
    const stats: Record<string, { totalLeads: number; enrolled: number; conversionRate: number }> = {};
    empList.forEach((e) => {
      const assigned = leadsList.filter((l) => l.assignedEmployeeId === e.id || l.assignedEmployeeName === e.fullName);
      const enrolled = assigned.filter((l) => l.status === 'ENROLLED');
      const rate = assigned.length > 0 ? Math.round((enrolled.length / assigned.length) * 100) : 0;
      stats[e.id] = { totalLeads: assigned.length, enrolled: enrolled.length, conversionRate: rate };
    });

    setEmployeeStats(stats);
    setEmployees(empList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = (permKey: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permKey) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permKey] };
      }
    });
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    try {
      if (editingEmployee) {
        await updateEmployeeInFirestore(editingEmployee.id, formData, {
          id: currentUser?.id || 'ADMIN',
          name: currentUser?.name || 'مدير النظام'
        });
      } else {
        await createEmployeeInFirestore(formData, {
          id: currentUser?.id || 'ADMIN',
          name: currentUser?.name || 'مدير النظام'
        });
      }

      setShowAddModal(false);
      setEditingEmployee(null);
      resetForm();
      await loadData();
    } catch (err: any) {
      alert(`خطأ في حفظ بيانات الموظف: ${err.message || err}`);
    }
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      whatsappNumber: emp.whatsappNumber || emp.phone,
      jobTitle: emp.jobTitle,
      department: emp.department,
      branch: emp.branch,
      role: emp.role,
      status: emp.status,
      permissions: emp.permissions || []
    });
    setShowAddModal(true);
  };

  const handleStatusToggle = async (emp: Employee, newStatus: EmployeeStatus) => {
    await updateEmployeeStatusInFirestore(emp.id, newStatus, {
      id: currentUser?.id || 'ADMIN',
      name: currentUser?.name || 'مدير النظام'
    });
    await loadData();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      whatsappNumber: '',
      jobTitle: 'مسؤول مبيعات ومنسق',
      department: 'المبيعات وخدمة العملاء',
      branch: 'الفرع الرئيسي (القاهرة)',
      role: 'COORDINATOR',
      status: 'ACTIVE',
      permissions: ['leads.view', 'leads.create', 'leads.edit', 'leads.call_log', 'leads.message_log', 'leads.followup', 'leads.convert', 'courses.view']
    });
  };

  const filteredEmployees = employees.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.phone.includes(q) ||
      e.jobTitle.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <Users className="w-3.5 h-3.5" /> SMARTTECH TEAM MANAGEMENT SYSTEM
          </span>
          <h2 className="text-2xl font-black text-white">إدارة حسابات الموظفين وصلاحيات فريق العمل</h2>
          <p className="text-xs text-slate-400">
            إضافة وإدارة حسابات موظفي سمارتك (خديجة، مهيتاب، حبيبة وبقية الفريق) وتحديد الأدوار، الفروع، وتراخيص الـ CRM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setEditingEmployee(null);
              setShowAddModal(true);
            }}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موظف جديد 👤</span>
          </button>
          <button
            onClick={loadData}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Employees Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const stats = employeeStats[emp.id] || { totalLeads: 0, enrolled: 0, conversionRate: 0 };
          return (
            <div
              key={emp.id}
              className={`bg-slate-950 rounded-3xl border p-6 space-y-4 shadow-xl relative overflow-hidden transition hover:border-slate-700 ${
                emp.status === 'ACTIVE'
                  ? 'border-slate-800'
                  : emp.status === 'SUSPENDED'
                  ? 'border-red-900/50 bg-red-950/10'
                  : 'border-amber-900/40 opacity-75'
              }`}
            >
              {/* Employee Top Badge */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      {emp.fullName}
                      <span className="text-[10px] font-mono font-bold text-slate-500">({emp.employeeId})</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {emp.jobTitle}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                    emp.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : emp.status === 'SUSPENDED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {emp.status === 'ACTIVE' ? 'نشط' : emp.status === 'SUSPENDED' ? 'موقوف' : 'غير نشط'}
                </span>
              </div>

              {/* Contacts & Department */}
              <div className="space-y-1.5 text-xs text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{emp.department} • {emp.branch}</span>
                </div>
              </div>

              {/* Performance Mini Bar */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">الليدز المعينة</span>
                  <span className="text-sm font-black text-white">{stats.totalLeads}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">المسجلين</span>
                  <span className="text-sm font-black text-emerald-400">{stats.enrolled}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">نسبة التحويل</span>
                  <span className="text-sm font-black text-amber-400">{stats.conversionRate}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <button
                  onClick={() => handleEditClick(emp)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تعديل الصلاحيات</span>
                </button>

                {emp.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusToggle(emp, 'SUSPENDED')}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>تجميد الحساب</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusToggle(emp, 'ACTIVE')}
                    className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>تنشيط الموظف</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl dir-rtl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                {editingEmployee ? `تعديل الموظف (${editingEmployee.fullName})` : 'إضافة موظف جديد لسمارتك أكاديمي'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs font-bold text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">اسم الموظف الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="مثال: خديجة محمد"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="khadija@smarttech.edu"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">رقم الهاتف / الواتساب *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsappNumber: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="مثال: مسؤولة مبيعات ومنسقة كورسات"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">القسم</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="المبيعات وخدمة العملاء">المبيعات وخدمة العملاء</option>
                    <option value="شؤون الطلاب والقبول">شؤون الطلاب والقبول</option>
                    <option value="التسويق والميديا">التسويق والميديا</option>
                    <option value="الإدارة العامة">الإدارة العامة</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">الفرع</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="الفرع الرئيسي (القاهرة)">الفرع الرئيسي (القاهرة)</option>
                    <option value="فرع أونلاين">فرع أونلاين</option>
                    <option value="فرع الجيزة">فرع الجيزة</option>
                    <option value="فرع الإسكندرية">فرع الإسكندرية</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">الدور الوظيفي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="COORDINATOR">منسق (Coordinator)</option>
                    <option value="SALES">مسؤول مبيعات (Sales)</option>
                    <option value="RECEPTION">استقبال (Reception)</option>
                    <option value="ADMIN">مدير نظام (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">حالة الحساب</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="ACTIVE">نشط (Active)</option>
                    <option value="INACTIVE">غير نشط (Inactive)</option>
                    <option value="SUSPENDED">موقوف (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <label className="block font-black text-white text-xs">صلاحيات الـ CRM والأكاديمية:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.key);
                    return (
                      <button
                        type="button"
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{perm.label}</span>
                        {isChecked && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  {editingEmployee ? 'حفظ التعديلات' : 'تأكيد إضافة الموظف 👤'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
