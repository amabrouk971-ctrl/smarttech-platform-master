import React, { useState, useEffect } from 'react';
import { User, Role, CustomRole, DataScope, ApprovalStatus } from '../../types';
import { ALL_PERMISSIONS, ALL_PAGES, DEFAULT_ROLE_PERMISSIONS, getRoleLabelAr } from '../../lib/permissions';
import { fetchCustomRolesFromFirestore, saveCustomRoleToFirestore, deleteCustomRoleFromFirestore, fetchAllUsersFromFirestore, updateUserProfileInFirestore, logAuditEventInFirestore } from '../../services/firebaseService';
import { Shield, Lock, Key, Plus, Save, Trash2, Users, CheckSquare, Square, Eye, ShieldAlert, Cpu, Search, Filter, Check, UserCheck, Edit3 } from 'lucide-react';

interface PermissionManagerCMSProps {
  currentUser: User | null;
}

export const PermissionManagerCMS: React.FC<PermissionManagerCMSProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('users');
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for Users
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // New/Editing Custom Role Form State
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedDataScope, setSelectedDataScope] = useState<DataScope>('BRANCH');

  // Selected User for permission & role overrides
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPrimaryRole, setUserPrimaryRole] = useState<Role>(Role.STUDENT);
  const [userApprovalStatus, setUserApprovalStatus] = useState<ApprovalStatus>('APPROVED');
  const [userCustomRoleId, setUserCustomRoleId] = useState<string>('');
  const [userOverridePermissions, setUserOverridePermissions] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    const roles = await fetchCustomRolesFromFirestore();
    const users = await fetchAllUsersFromFirestore();
    setCustomRoles(roles as CustomRole[]);
    setUsersList(users);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRole = async () => {
    if (!roleName) return;
    const roleId = editingRoleId || `role-${Date.now()}`;
    const roleObj: CustomRole = {
      id: roleId,
      name: roleName,
      description: roleDesc,
      permissions: selectedPermissions,
      pageAccess: selectedPages,
      dataScope: selectedDataScope,
      createdBy: currentUser?.id || 'SUPER_ADMIN',
      createdAt: new Date().toISOString()
    };

    await saveCustomRoleToFirestore(roleObj);
    alert(`تم حفظ الدور المخصص (${roleName}) بنجاح في Firestore!`);
    resetRoleForm();
    loadData();
  };

  const resetRoleForm = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDesc('');
    setSelectedPermissions([]);
    setSelectedPages([]);
    setSelectedDataScope('BRANCH');
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('هل أنت تأكد من حذف هذا الدور المخصص؟')) {
      await deleteCustomRoleFromFirestore(roleId);
      loadData();
    }
  };

  const handleQuickRoleChange = async (targetUser: User, newRole: Role) => {
    const updatedUser: User = {
      ...targetUser,
      role: newRole
    };
    await updateUserProfileInFirestore(updatedUser);
    await logAuditEventInFirestore({
      actorId: currentUser?.id || 'SUPER_ADMIN',
      actorName: currentUser?.name || 'المشرف العام',
      actorRole: currentUser?.role || 'SUPER_ADMIN',
      action: `تغيير دور المستخدم (${targetUser.name}) إلى (${newRole})`,
      targetType: 'USER',
      targetId: targetUser.id,
      details: { previousRole: targetUser.role, newRole }
    });
    alert(`تم تعديل دور ${targetUser.name} إلى ${getRoleLabelAr(newRole)} بنجاح!`);
    loadData();
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return;
    const updatedUser: User = {
      ...selectedUser,
      role: userPrimaryRole,
      approvalStatus: userApprovalStatus,
      customRoleId: userCustomRoleId || undefined,
      permissions: userOverridePermissions
    };

    await updateUserProfileInFirestore(updatedUser);
    await logAuditEventInFirestore({
      actorId: currentUser?.id || 'SUPER_ADMIN',
      actorName: currentUser?.name || 'المشرف العام',
      actorRole: currentUser?.role || 'SUPER_ADMIN',
      action: `تحديث دور وصلاحيات المستخدم الشاملة (${selectedUser.name})`,
      targetType: 'USER',
      targetId: selectedUser.id,
      details: { role: userPrimaryRole, approvalStatus: userApprovalStatus, customRoleId: userCustomRoleId }
    });
    alert(`تم تحديث دور وصلاحيات وحالة حساب (${selectedUser.name}) بنجاح!`);
    setSelectedUser(null);
    loadData();
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const togglePage = (pageId: string) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter(p => p !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = !searchQuery || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" /> Super Admin Access & Role Control Engine
          </span>
          <h2 className="text-2xl font-black">إدارة أدوار الحسابات وتصاريح الوصول (Role & Access Assignment)</h2>
          <p className="text-xs text-slate-400">
            تحكم كامل للمشرف العام في تعيين أدوار المستخدمين (طالب، حاضر ورش عمل، مدرب، ولي أمر، إلخ) وتحديد مستويات وصلاحيات الوصول الدقيقة.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-red-600 text-white shadow' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" /> إدارة وتعيين أفراد الحسابات ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles' ? 'bg-red-600 text-white shadow' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" /> الأدوار المخصصة والتصاريح ({customRoles.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-red-600" /> تعيين الأدوار والصلاحيات الفردية للأشخاص:
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                المشرف العام هو المرجع المستقل لتحديد دور كل مستخدم وتسليم صلاحيات الوصول المناسبة له.
              </p>
            </div>

            {/* Search & Filter bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الشخص أو البريد..."
                  className="pr-9 pl-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold w-48 sm:w-64"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="ALL">جميع الأدوار ({usersList.length})</option>
                <option value={Role.SUPER_ADMIN}>مشرف عام</option>
                <option value={Role.ADMIN}>مدير نظام</option>
                <option value={Role.COORDINATOR}>منسق</option>
                <option value={Role.TEACHER}>مدرب / معلم</option>
                <option value={Role.STUDENT}>طالب أكاديمي</option>
                <option value={Role.ATTENDEE}>حاضر / متدرب ورشة</option>
                <option value={Role.PARENT}>ولي أمر</option>
                <option value={Role.GUEST}>زائر</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">المستخدم / الشخص</th>
                  <th className="p-3">تعيين الدور الأساسي (Role)</th>
                  <th className="p-3">حالة الحساب والاعتماد</th>
                  <th className="p-3">الدور المخصص</th>
                  <th className="p-3">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      لا يوجد مستخدمون يطابقون خيارات البحث أو التصفية.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3">
                        <div className="font-black text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email} | {u.phone || 'بدون هاتف'}</div>
                      </td>

                      {/* Dynamic Role Change Selector */}
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleQuickRoleChange(u, e.target.value as Role)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-extrabold text-slate-900 dark:text-amber-400 cursor-pointer hover:border-red-500 transition"
                        >
                          <option value={Role.SUPER_ADMIN}>المشرف العام (Super Admin)</option>
                          <option value={Role.ADMIN}>مدير نظام (Admin)</option>
                          <option value={Role.COORDINATOR}>منسق أكاديمي (Coordinator)</option>
                          <option value={Role.TEACHER}>مدرب / معلم (Instructor)</option>
                          <option value={Role.STUDENT}>طالب أكاديمي (Student)</option>
                          <option value={Role.ATTENDEE}>حاضر / متدرب ورش عمل (Attendee)</option>
                          <option value={Role.PARENT}>ولي أمر (Parent)</option>
                          <option value={Role.GUEST}>زائر (Guest)</option>
                        </select>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          u.approvalStatus === 'APPROVED' || u.approvalStatus === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : u.approvalStatus === 'PENDING_APPROVAL' || u.approvalStatus === 'UNDER_REVIEW'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {u.approvalStatus || 'APPROVED'}
                        </span>
                      </td>

                      <td className="p-3 text-blue-500">
                        {u.customRoleId 
                          ? customRoles.find(cr => cr.id === u.customRoleId)?.name || u.customRoleId 
                          : '-'}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setUserPrimaryRole(u.role);
                            setUserApprovalStatus(u.approvalStatus || 'APPROVED');
                            setUserCustomRoleId(u.customRoleId || '');
                            setUserOverridePermissions(u.permissions || []);
                          }}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer flex items-center gap-1.5 transition text-[11px]"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" /> تعديل الوصول التفصيلي
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* User Permission & Role Modal Drawer */}
          {selectedUser && (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl text-white space-y-5 mt-4 shadow-2xl dir-rtl text-right">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-amber-400 font-extrabold text-xs block">نافذة تعيين الدور المباشر والصلاحيات:</span>
                  <h4 className="font-black text-xl text-white">{selectedUser.name} ({selectedUser.email})</h4>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-300 mb-1">1. تعيين الدور الرئيسي الأساسي (Role):</label>
                  <select
                    value={userPrimaryRole}
                    onChange={(e) => setUserPrimaryRole(e.target.value as Role)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-amber-400 font-black"
                  >
                    <option value={Role.SUPER_ADMIN}>المشرف العام (Super Admin)</option>
                    <option value={Role.ADMIN}>مدير منصة (Admin)</option>
                    <option value={Role.COORDINATOR}>منسق فروع (Coordinator)</option>
                    <option value={Role.TEACHER}>مدرب / معلم (Instructor)</option>
                    <option value={Role.STUDENT}>طالب أكاديمي (Student)</option>
                    <option value={Role.ATTENDEE}>حاضر / متدرب ورش عمل (Attendee)</option>
                    <option value={Role.PARENT}>ولي أمر (Parent)</option>
                    <option value={Role.GUEST}>زائر (Guest)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">2. حالة تفعيل واعتماد الحساب:</label>
                  <select
                    value={userApprovalStatus}
                    onChange={(e) => setUserApprovalStatus(e.target.value as ApprovalStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-emerald-400 font-bold"
                  >
                    <option value="APPROVED">APPROVED - معتمد ومفعل</option>
                    <option value="ACTIVE">ACTIVE - نشط بالمنظومة</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL - قيد مراجعة المشرف</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW - قيد الفحص</option>
                    <option value="SUSPENDED">SUSPENDED - موقوف مؤقتاً</option>
                    <option value="REJECTED">REJECTED - مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">3. ربط بدور مخصص (Custom Role):</label>
                  <select
                    value={userCustomRoleId}
                    onChange={(e) => setUserCustomRoleId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  >
                    <option value="">افتراضي (بدون دور مخصص)</option>
                    {customRoles.map((cr) => (
                      <option key={cr.id} value={cr.id}>{cr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={handleSaveUserPermissions}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> حفظ وإقرار الدور والتراخيص في Firestore
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Roles List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" /> الأدوار المتاحة
                </h3>
                <button
                  onClick={resetRoleForm}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> دور جديد
                </button>
              </div>

              {/* Built-in System Roles */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">أدوار النظام الأساسية (Built-in)</span>
                {Object.keys(DEFAULT_ROLE_PERMISSIONS).map((rKey) => (
                  <div key={rKey} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-200">{getRoleLabelAr(rKey as Role)}</span>
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-full">
                      نظامي 🔒
                    </span>
                  </div>
                ))}
              </div>

              {/* Custom Roles */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">الأدوار المخصصة (Custom Roles)</span>
                {customRoles.length === 0 ? (
                  <p className="text-xs text-slate-400">لا توجد أدوار مخصصة مضافة بعد.</p>
                ) : (
                  customRoles.map((cr) => (
                    <div key={cr.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold flex justify-between items-center">
                      <div>
                        <div className="text-slate-900 dark:text-white">{cr.name}</div>
                        <div className="text-[10px] text-slate-400">{cr.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingRoleId(cr.id);
                            setRoleName(cr.name);
                            setRoleDesc(cr.description);
                            setSelectedPermissions(cr.permissions);
                            setSelectedPages(cr.pageAccess);
                            setSelectedDataScope(cr.dataScope);
                          }}
                          className="p-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteRole(cr.id)}
                          className="p-1.5 rounded bg-red-100 text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Role Editor Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <h3 className="font-black text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                {editingRoleId ? `تعديل الدور المخصص: ${roleName}` : 'إنشاء دور جديد بميزات وتصاريح مخصصة'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">اسم الدور بالعربية:</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="مثال: منسق فروع الفجيرة / مشرف مختبرات"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">نطاق الوصول للبيانات (Data Scope):</label>
                  <select
                    value={selectedDataScope}
                    onChange={(e) => setSelectedDataScope(e.target.value as DataScope)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="ALL">ALL - وصول كامل لكل الفروع والكورسات</option>
                    <option value="BRANCH">BRANCH - مقتصر على فرع معين</option>
                    <option value="COURSE">COURSE - مقتصر على كورس محدد</option>
                    <option value="GROUP">GROUP - مقتصر على مجموعة محددة</option>
                    <option value="ASSIGNED_STUDENTS">ASSIGNED_STUDENTS - مقتصر على الطلاب المسندين فقط</option>
                    <option value="OWN_DATA">OWN_DATA - بياناته الشخصية فقط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs mb-1 font-bold">الوصف والتوضيح:</label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="وصف مهام هذا الدور المخصص..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Page Access Selection */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-amber-500">1. التصريح بالدخول للصفحات (Page Access Permissions)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold">
                  {ALL_PAGES.map((page) => {
                    const active = selectedPages.includes(page.id);
                    return (
                      <button
                        type="button"
                        key={page.id}
                        onClick={() => togglePage(page.id)}
                        className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                          active
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {active ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
                        <span>{page.labelAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Action Permissions */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-red-600">2. الصلاحيات والإجراءات الدقيقة (Granular Action Permissions)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold">
                  {ALL_PERMISSIONS.map((perm) => {
                    const active = selectedPermissions.includes(perm);
                    return (
                      <button
                        type="button"
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                          active
                            ? 'bg-red-600/10 border-red-500 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {active ? <CheckSquare className="w-4 h-4 text-red-600" /> : <Square className="w-4 h-4" />}
                        <span className="font-mono text-[11px]">{perm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetRoleForm}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" /> حفظ وتوثيق الدور في Firestore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

