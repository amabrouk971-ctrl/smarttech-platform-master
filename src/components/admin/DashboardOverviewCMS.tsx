import React, { useState, useEffect } from 'react';
import { collection, getCountFromServer, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, GraduationCap, DollarSign, Activity, BookOpen, Clock, ChevronRight } from 'lucide-react';

export const DashboardOverviewCMS: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0,
    leads: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, coursesSnap, enrollmentsSnap, leadsSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'courses')),
          getCountFromServer(collection(db, 'enrollments')),
          getCountFromServer(collection(db, 'leads'))
        ]);
        
        setStats({
          users: usersSnap.data().count,
          courses: coursesSnap.data().count,
          enrollments: enrollmentsSnap.data().count,
          leads: leadsSnap.data().count,
          revenue: 0 // Would calculate from completed orders
        });
      } catch (err) {
        console.warn('Error fetching overview stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12 text-slate-500">جاري تحميل البيانات...</div>;
  }

  const statCards = [
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'الكورسات النشطة', value: stats.courses, icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'الالتحاقات', value: stats.enrollments, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'العملاء المحتملين (Leads)', value: stats.leads, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6 dir-rtl text-right">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{card.label}</p>
              <h4 className="text-2xl font-black text-white">{card.value}</h4>
            </div>
            <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">نشاط المنصة الأخير</h3>
          <div className="flex items-center justify-center h-48 text-slate-500">
            لا توجد نشاطات مسجلة اليوم.
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">نظرة عامة على الإيرادات</h3>
          <div className="flex items-center justify-center h-48 text-slate-500">
            بيانات الإيرادات غير متوفرة حالياً.
          </div>
        </div>
      </div>
    </div>
  );
};
