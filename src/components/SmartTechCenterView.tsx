import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Monitor, 
  Award, 
  Users, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Bot, 
  Code, 
  ChevronRight,
  Wifi,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  SmartTechCenterProfile, 
  SmartTechFacility, 
  SmartTechEquipment, 
  SmartTechService, 
  SmartTechStaffMember,
  getSmartTechCenterProfile, 
  getSmartTechFacilities, 
  getSmartTechEquipment, 
  getSmartTechServices, 
  getSmartTechStaff, 
  getDynamicComputerCount 
} from '../services/smarttechCenterService';
import { EcosystemPlatform, fetchEcosystemPlatformsFromFirestore, DEFAULT_ECOSYSTEM_PLATFORMS } from '../services/homepageCMS';
import { MAIN_WEBSITE_URL, APP_PLATFORM_URL } from '../services/domainService';

interface SmartTechCenterViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export const SmartTechCenterView: React.FC<SmartTechCenterViewProps> = ({ onNavigateTab }) => {
  const { isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState<'STORY' | 'FACILITIES' | 'EQUIPMENT' | 'SERVICES' | 'STAFF' | 'PLATFORMS'>('STORY');

  const [profile, setProfile] = useState<SmartTechCenterProfile | null>(null);
  const [facilities, setFacilities] = useState<SmartTechFacility[]>([]);
  const [equipment, setEquipment] = useState<SmartTechEquipment[]>([]);
  const [services, setServices] = useState<SmartTechService[]>([]);
  const [staff, setStaff] = useState<SmartTechStaffMember[]>([]);
  const [platforms, setPlatforms] = useState<EcosystemPlatform[]>(DEFAULT_ECOSYSTEM_PLATFORMS);

  const [computerCounts, setComputerCounts] = useState<{ totalComputers: number; totalDevices: number }>({ totalComputers: 0, totalDevices: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [facilityCategory, setFacilityCategory] = useState<string>('ALL');
  const [equipmentCategory, setEquipmentCategory] = useState<string>('ALL');

  useEffect(() => {
    loadAllCenterData();
  }, []);

  const loadAllCenterData = async () => {
    setLoading(true);
    try {
      const [profData, facData, eqData, srvData, staffData, platData, counts] = await Promise.all([
        getSmartTechCenterProfile(),
        getSmartTechFacilities(),
        getSmartTechEquipment(),
        getSmartTechServices(),
        getSmartTechStaff(true), // public staff only
        fetchEcosystemPlatformsFromFirestore(),
        getDynamicComputerCount()
      ]);

      setProfile(profData);
      setFacilities(facData.filter(f => f.published));
      setEquipment(eqData.filter(e => e.published));
      setServices(srvData.filter(s => s.published));
      setStaff(staffData);
      setPlatforms(platData.length > 0 ? platData : DEFAULT_ECOSYSTEM_PLATFORMS);
      setComputerCounts(counts);
    } catch (err) {
      console.error('Error loading SmartTech Center Data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => facilityCategory === 'ALL' || f.category === facilityCategory);
  const filteredEquipment = equipment.filter(e => equipmentCategory === 'ALL' || e.category === equipmentCategory);

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">
          {isArabic ? 'جاري تحميل بيانات مركز سمارتك الرسمية...' : 'Loading official SmartTech Center details...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-slate-900/90 to-slate-950 z-0"></div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>{isArabic ? 'المقر والأكاديمية الرسمية M1' : 'Official SmartTech Center & Labs'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {isArabic ? profile.centerNameAr : profile.centerNameEn}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
            {isArabic ? profile.descriptionAr : profile.descriptionEn}
          </p>

          {/* Key Dynamic Database Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-red-500">{computerCounts.totalComputers}+</span>
              <span className="text-[11px] font-bold text-slate-400">
                {isArabic ? 'أجهزة حاسوب تفاعلية' : 'Workstation PCs'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-emerald-400">{profile.trainingRoomsCount}+</span>
              <span className="text-[11px] font-bold text-slate-400">
                {isArabic ? 'مختبرات وقاعات تدريب' : 'Labs & Training Rooms'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-amber-400">{profile.totalRoomCapacity}</span>
              <span className="text-[11px] font-bold text-slate-400">
                {isArabic ? 'سعة الاستيعاب اللحظية' : 'Student Seat Capacity'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-2xl font-black text-cyan-400">{profile.yearsOfExperience}+</span>
              <span className="text-[11px] font-bold text-slate-400">
                {isArabic ? 'سنوات من الخبرة' : 'Years of Excellence'}
              </span>
            </div>
          </div>

          {/* Quick Domain Navigation CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={APP_PLATFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <span>{isArabic ? 'دخول منصة التعلم والمحاسبة المعتمدة (app.smart-courses.org)' : 'Open SmartTech Platform (app.smart-courses.org)'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={profile.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition border border-slate-700"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{isArabic ? 'الموقع على خرائط جوجل' : 'Google Maps Location'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'STORY', labelAr: 'عن سمارتك والرؤية', labelEn: 'Story & Vision', icon: <Building2 className="w-4 h-4" /> },
          { id: 'FACILITIES', labelAr: 'المختبرات والقاعات', labelEn: 'Facilities & Labs', icon: <Monitor className="w-4 h-4" /> },
          { id: 'EQUIPMENT', labelAr: 'الأجهزة والمعدات', labelEn: 'Devices & Equipment', icon: <Cpu className="w-4 h-4" /> },
          { id: 'SERVICES', labelAr: 'خدماتنا وبرامجنا', labelEn: 'Services & Programs', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'STAFF', labelAr: 'الطاقم الأكاديمي', labelEn: 'Academic Staff', icon: <Users className="w-4 h-4" /> },
          { id: 'PLATFORMS', labelAr: 'منظومة سمارتك الرقمية', labelEn: 'SmartTech Ecosystem', icon: <Globe className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t.icon}
            <span>{isArabic ? t.labelAr : t.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STORY & VISION                                         */}
      {/* ============================================================ */}
      {activeTab === 'STORY' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Story & History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <span>{isArabic ? 'تاريخ وقصة سمارتك' : 'SmartTech Story & History'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isArabic ? profile.historyAr : profile.historyEn}
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">{isArabic ? 'فلسفة التدريب:' : 'Training Philosophy:'}</span>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {isArabic ? profile.philosophyAr : profile.philosophyEn}
                </p>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-black text-red-600 uppercase tracking-wide mb-2">
                  {isArabic ? 'الرسالة' : 'Our Mission'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {isArabic ? profile.missionAr : profile.missionEn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-emerald-500 uppercase tracking-wide mb-2">
                  {isArabic ? 'الرؤية المستقبلية' : 'Our Vision'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {isArabic ? profile.visionAr : profile.visionEn}
                </p>
              </div>
            </div>
          </div>

          {/* Student Facilities & Technology */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-white">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>{isArabic ? 'التجهيزات المتاحة للطلاب والشبكات' : 'Available Technology & Infrastructure'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'التقنيات والأجهزة المتاحة:' : 'Available Tech:'}</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {isArabic ? profile.availableTechnologyAr : profile.availableTechnologyEn}
                </p>

                <h4 className="text-xs font-bold text-slate-400 uppercase pt-2">{isArabic ? 'معلومات الشبكة والإنترنت:' : 'Network Specs:'}</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {isArabic ? profile.internetNetworkInfoAr : profile.internetNetworkInfoEn}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">{isArabic ? 'مرافق وخدمات الطلاب:' : 'Student Facilities:'}</h4>
                <ul className="space-y-2">
                  {(isArabic ? profile.studentFacilitiesAr : profile.studentFacilitiesEn).map((fac, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-bold bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: FACILITIES & LABS                                     */}
      {/* ============================================================ */}
      {activeTab === 'FACILITIES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {isArabic ? 'مختبرات وقاعات سمارتك الفعلية' : 'Real SmartTech Facilities'}
            </h3>
            <span className="text-xs font-bold text-red-600">{filteredFacilities.length} {isArabic ? 'مرفق مُوثق' : 'Facilities'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFacilities.map(f => (
              <div key={f.facilityId} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img src={f.image} alt={f.nameAr} className="w-full h-full object-cover transition duration-500 hover:scale-105" />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-black text-white border border-white/20">
                      {isArabic ? 'السعة:' : 'Capacity:'} {f.capacity} {isArabic ? 'مقعد' : 'Seats'}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h4 className="font-black text-lg text-slate-900 dark:text-white">
                      {isArabic ? f.nameAr : f.nameEn}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isArabic ? f.descriptionAr : f.descriptionEn}
                    </p>

                    {/* Equipment list */}
                    {f.equipment && f.equipment.length > 0 && (
                      <div className="space-y-1 pt-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{isArabic ? 'المعدات المتاحة:' : 'Equipment:'}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {f.equipment.map((eq, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>{isArabic ? 'الحالة: جاهز ومُجهز بالكامل' : 'Status: Fully Operational'}</span>
                  <span className="text-emerald-500 font-black">● {f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DEVICES & EQUIPMENT                                   */}
      {/* ============================================================ */}
      {activeTab === 'EQUIPMENT' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-red-600" />
              <span>{isArabic ? 'سجل الأجهزة والتجهيزات التقنية الموثقة' : 'Verified Hardware & Equipment Inventory'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isArabic ? 'جميع الأعداد والمواصفات مسجلة ومحسوبة مباشرة من قاعدة البيانات الفعلية لسمارتك.' : 'All numbers and specifications are aggregated live from the SmartTech database.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map(eq => (
              <div key={eq.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 uppercase">
                      {eq.category}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                      {isArabic ? eq.nameAr : eq.nameEn}
                    </h4>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                    {eq.quantity}x
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {isArabic ? eq.descriptionAr : eq.descriptionEn}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-mono space-y-1">
                  <div><strong>{isArabic ? 'الموقع: ' : 'Location: '}</strong>{eq.location}</div>
                  {eq.specifications && Object.keys(eq.specifications).length > 0 && (
                    <div className="text-[10px] text-slate-400">
                      {Object.entries(eq.specifications).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: SERVICES & PROGRAMS                                   */}
      {/* ============================================================ */}
      {activeTab === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(srv => (
            <div key={srv.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-600/10 text-red-600 font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {isArabic ? srv.titleAr : srv.titleEn}
                  </h4>
                  <span className="text-xs font-bold text-slate-400">
                    {isArabic ? srv.targetAudienceAr : srv.targetAudienceEn}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isArabic ? srv.descriptionAr : srv.descriptionEn}
              </p>

              <button
                onClick={() => onNavigateTab && onNavigateTab('courses')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isArabic ? 'استعراض المسارات والدورات الخاصة' : 'Browse Related Courses'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: STAFF & INSTRUCTORS                                   */}
      {/* ============================================================ */}
      {activeTab === 'STAFF' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(s => (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
              <img src={s.photo} alt={s.nameAr} className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-md border-2 border-red-600/20" />
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  {isArabic ? s.nameAr : s.nameEn}
                </h4>
                <p className="text-xs font-extrabold text-red-600 mt-0.5">
                  {isArabic ? s.roleAr : s.roleEn}
                </p>
                <p className="text-[11px] text-slate-400">{isArabic ? s.departmentAr : s.departmentEn}</p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {isArabic ? s.bioAr : s.bioEn}
              </p>

              {s.specializations && s.specializations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {s.specializations.map((sp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {sp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: ECOSYSTEM PLATFORMS                                   */}
      {/* ============================================================ */}
      {activeTab === 'PLATFORMS' && (
        <div className="space-y-6">
          <div className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-800 space-y-4 text-center">
            <h3 className="text-2xl font-black">{isArabic ? 'منظومة منصات سمارتك الرقمية' : 'SmartTech Digital Ecosystem'}</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              {isArabic ? 'تتكامل المكاتب والأنظمة الرقمية لسمارتك لتقديم تجربة متكاملة بين الموقع الرسمي والمنصة التعليمية والمحاسبية.' : 'Integrated digital platforms seamlessly linking the official website with the protected learning and accounting systems.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platforms.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">
                      {isArabic ? p.nameAr : p.nameEn}
                    </h4>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isArabic ? p.descriptionAr : p.descriptionEn}
                  </p>

                  <div className="space-y-1 pt-2">
                    {(isArabic ? p.featuresAr : p.featuresEn).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{isArabic ? p.ctaTextAr : p.ctaTextEn}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
