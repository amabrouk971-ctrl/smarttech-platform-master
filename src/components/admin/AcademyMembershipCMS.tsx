import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Clock, Search, RefreshCw, AlertCircle, Plus, CheckCircle, Edit, Key } from 'lucide-react';
import { AcademyMembership, AcademyMembershipStatus, User } from '../../types';
import { fetchAcademyMembershipsFromFirestore, saveAcademyMembershipToFirestore } from '../../services/academyService';

interface AcademyMembershipCMSProps {
  currentUser?: User | null;
}

export const AcademyMembershipCMS: React.FC<AcademyMembershipCMSProps> = ({ currentUser }) => {
  const [memberships, setMemberships] = useState<AcademyMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [editingMembership, setEditingMembership] = useState<AcademyMembership | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const list = await fetchAcademyMembershipsFromFirestore();
    setMemberships(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (mem: AcademyMembership, newStatus: AcademyMembershipStatus) => {
    const updated: AcademyMembership = {
      ...mem,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    await saveAcademyMembershipToFirestore(updated, currentUser ? { id: currentUser.id, name: currentUser.name } : undefined);
    await loadData();
  };

  const handleSaveEdit = async () => {
    if (!editingMembership) return;
    await saveAcademyMembershipToFirestore(editingMembership, currentUser ? { id: currentUser.id, name: currentUser.name } : undefined);
    setEditingMembership(null);
    await loadData();
  };

  const filtered = memberships.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.studentName?.toLowerCase().includes(q) ||
        m.parentName?.toLowerCase().includes(q) ||
        m.studentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <UserCheck className="w-3.5 h-3.5" /> ACADEMY MEMBERSHIPS & ENTITLEMENT CONTROL
          </span>
          <h2 className="text-2xl font-black text-white">إدارة عضويات الأكاديمية والتراخيص</h2>
          <p className="text-xs text-slate-400">
            التحكم الشامل في صلاحيات دخول الطلاب للألعاب 3D، المعامل، الكورسات، والامتحانات، مع إمكانية التجميد أو التجديد.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب أو ولي الأمر..."
            className="bg-transparent text-white outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'جميع العضويات' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Memberships Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold space-y-2">
            <UserCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p>لا توجد عضويات أكاديمية مسجلة بـ Firestore حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">رقم العضوية</th>
                  <th className="p-3">اسم الطالب وولي الأمر</th>
                  <th className="p-3">نوع العضوية</th>
                  <th className="p-3">تاريخ البداية والنهاية</th>
                  <th className="p-3">الحالة والصلاحية</th>
                  <th className="p-3">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-[11px] text-amber-400">{m.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{m.studentName || m.studentId}</div>
                      <div className="text-[10px] text-slate-400">ولي الأمر: {m.parentName || 'غير مدخل'}</div>
                    </td>
                    <td className="p-3 font-bold text-blue-400">{m.membershipType || 'عضوية قياسية'}</td>
                    <td className="p-3 text-[11px] text-slate-300">
                      <div>من: {m.startDate}</div>
                      <div className="text-amber-400">إلى: {m.endDate}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : m.status === 'SUSPENDED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(m, m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                          m.status === 'ACTIVE'
                            ? 'bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        }`}
                      >
                        {m.status === 'ACTIVE' ? 'تجميد (Suspend)' : 'تنشيط العضوية'}
                      </button>

                      <button
                        onClick={() => setEditingMembership(m)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg border border-slate-700 transition cursor-pointer"
                      >
                        <Edit className="w-3 h-3 inline ml-1" /> تعديل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Membership Modal */}
      {editingMembership && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-base text-white">تعديل بيانات عضوية الأكاديمية</h3>
              <button
                onClick={() => setEditingMembership(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  value={editingMembership.studentName || ''}
                  onChange={(e) => setEditingMembership({ ...editingMembership, studentName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">تاريخ البداية:</label>
                  <input
                    type="date"
                    value={editingMembership.startDate || ''}
                    onChange={(e) => setEditingMembership({ ...editingMembership, startDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    value={editingMembership.endDate || ''}
                    onChange={(e) => setEditingMembership({ ...editingMembership, endDate: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">ملاحظات العضوية:</label>
                <textarea
                  value={editingMembership.notes || ''}
                  onChange={(e) => setEditingMembership({ ...editingMembership, notes: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none h-20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setEditingMembership(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow cursor-pointer"
                >
                  حفظ التغييرات ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
