import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Role, 
  CustomerAddress, 
  CustomerEducationRecord, 
  CustomerDocument, 
  CustomerIdentityDocument, 
  ProfileEmergencyContact,
  Course
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  updateUserProfileData, 
  uploadProfileFile, 
  saveCustomerDocument, 
  deleteCustomerDocument, 
  saveCustomerIdentityDocument, 
  calculateProfileCompletion,
  fetchProfileSettingsConfig,
  DEFAULT_PROFILE_SETTINGS
} from '../../services/profileService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Shield, 
  Award, 
  Camera, 
  Upload, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Sparkles, 
  Save, 
  Plus, 
  Check, 
  ExternalLink, 
  Info, 
  ChevronRight,
  BookOpen,
  Calendar,
  Building,
  Briefcase
} from 'lucide-react';

interface CustomerProfilePageProps {
  currentUser: User | null;
  courses?: Course[];
  onUpdateUser?: (updated: User) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  currentUser,
  courses = [],
  onUpdateUser,
  onNavigateToTab
}) => {
  const { isArabic, dir } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'personal' | 'photo' | 'address' | 'education' | 'identity' | 'certificates'>('overview');

  // Loading & Saving state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Field Settings
  const [settingsConfig, setSettingsConfig] = useState(DEFAULT_PROFILE_SETTINGS);

  useEffect(() => {
    fetchProfileSettingsConfig().then(setSettingsConfig).catch(console.error);
  }, []);

  // Form State initialized from currentUser
  const [firstName, setFirstName] = useState(currentUser?.firstName || currentUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'>(currentUser?.gender || 'PREFER_NOT_TO_SAY');
  const [email] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.whatsappNumber || currentUser?.phone || '');
  const [isPhoneAndWhatsappSame, setIsPhoneAndWhatsappSame] = useState(currentUser?.isPhoneAndWhatsappSame ?? true);
  
  // Address State
  const [address, setAddress] = useState<CustomerAddress>(currentUser?.address || {
    country: currentUser?.country || 'Saudi Arabia',
    city: currentUser?.city || 'Riyadh',
    governorate: '',
    area: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: '',
    additionalNotes: ''
  });

  // Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState<ProfileEmergencyContact>(currentUser?.emergencyContactDetails || {
    name: currentUser?.studentProfile?.parentName || '',
    relation: 'PARENT',
    phone: currentUser?.studentProfile?.parentPhone || '',
    whatsapp: currentUser?.studentProfile?.parentPhone || ''
  });

  // Photo & Visibility State
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [photoVisibility, setPhotoVisibility] = useState<'PRIVATE' | 'ACCOUNT_ONLY' | 'TEACHERS_STAFF' | 'CLASS' | 'PUBLIC'>(
    currentUser?.profilePhotoVisibility || 'ACCOUNT_ONLY'
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoCropZoom, setPhotoCropZoom] = useState(1);

  // Education History State
  const [educationHistory, setEducationHistory] = useState<CustomerEducationRecord[]>(currentUser?.educationHistory || []);
  const [newEduModalOpen, setNewEduModalOpen] = useState(false);
  const [eduInstName, setEduInstName] = useState('');
  const [eduType, setEduType] = useState<'SCHOOL' | 'UNIVERSITY' | 'INSTITUTE' | 'TRAINING_CENTER' | 'OTHER'>('SCHOOL');
  const [eduGrade, setEduGrade] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduDesc, setEduDesc] = useState('');

  // Educational Documents State
  const [documents, setDocuments] = useState<CustomerDocument[]>(currentUser?.documents || []);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'SCHOOL_CERTIFICATE' | 'STATEMENT' | 'UNIVERSITY_DEGREE' | 'TRAINING_CERTIFICATE' | 'DIPLOMA' | 'OTHER'>('SCHOOL_CERTIFICATE');
  const [docInstitution, setDocInstitution] = useState('');
  const [docIssueDate, setDocIssueDate] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Identity Documents State (Private)
  const [identityDocs, setIdentityDocs] = useState<CustomerIdentityDocument[]>(currentUser?.identityDocuments || []);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [idType, setIdType] = useState<'NATIONAL_ID' | 'PASSPORT' | 'STUDENT_ID' | 'OTHER'>('NATIONAL_ID');
  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState(false);

  // File input refs
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setAvatarUrl(currentUser.avatar || '');
      setFirstName(currentUser.firstName || currentUser.name?.split(' ')[0] || '');
      setLastName(currentUser.lastName || currentUser.name?.split(' ').slice(1).join(' ') || '');
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setGender(currentUser.gender || 'PREFER_NOT_TO_SAY');
      setPhone(currentUser.phone || '');
      setWhatsappNumber(currentUser.whatsappNumber || currentUser.phone || '');
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.educationHistory) setEducationHistory(currentUser.educationHistory);
      if (currentUser.documents) setDocuments(currentUser.documents);
      if (currentUser.identityDocuments) setIdentityDocs(currentUser.identityDocuments);
    }
  }, [currentUser]);

  // Handle Phone & WhatsApp Same checkbox
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (isPhoneAndWhatsappSame) {
      setWhatsappNumber(val);
    }
  };

  // Calculate Profile Completion
  const completion = calculateProfileCompletion({
    avatar: avatarUrl,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    phone,
    whatsappNumber,
    isPhoneAndWhatsappSame,
    country: address.country,
    city: address.city,
    address,
    educationHistory,
    emergencyContactDetails: emergencyContact
  });

  // Save General Profile Info
  const handleSavePersonalInfo = async () => {
    if (!currentUser) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const updatedData: Partial<User> = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || currentUser.name,
        displayName: displayName || `${firstName} ${lastName}`.trim() || currentUser.name,
        dateOfBirth,
        gender,
        phone,
        whatsappNumber: isPhoneAndWhatsappSame ? phone : whatsappNumber,
        isPhoneAndWhatsappSame,
        emergencyContactDetails: emergencyContact,
        country: address.country,
        city: address.city,
        address,
        profilePhotoVisibility: photoVisibility
      };

      await updateUserProfileData(currentUser.id, updatedData);

      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          ...updatedData
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMessage(err.message || 'Failed to save profile updates.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Device Profile Photo Upload
  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Check size & extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setErrorMessage(isArabic ? 'صيغة الملف غير مدعومة. يرجى اختيار JPG, PNG, WEBP.' : 'Unsupported format. Please select JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > settingsConfig.maxFileSizeMB * 1024 * 1024) {
      setErrorMessage(isArabic ? `حجم الصورة يفيض عن الحد المسموح (${settingsConfig.maxFileSizeMB} ميجابايت).` : `File size exceeds max limit (${settingsConfig.maxFileSizeMB} MB).`);
      return;
    }

    setUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const { downloadUrl } = await uploadProfileFile(currentUser.id, file, 'avatars');
      setAvatarUrl(downloadUrl);
      await updateUserProfileData(currentUser.id, { avatar: downloadUrl });

      if (onUpdateUser) {
        onUpdateUser({ ...currentUser, avatar: downloadUrl });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMessage(isArabic ? 'فشل رفع الصورة الشخصية' : 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Remove Photo
  const handleRemoveAvatar = async () => {
    if (!currentUser) return;
    setAvatarUrl('');
    try {
      await updateUserProfileData(currentUser.id, { avatar: '' });
      if (onUpdateUser) onUpdateUser({ ...currentUser, avatar: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // Add Education Record
  const handleAddEducationRecord = async () => {
    if (!eduInstName.trim() || !currentUser) return;
    const newRecord: CustomerEducationRecord = {
      id: `EDU-${Date.now()}`,
      institutionName: eduInstName.trim(),
      educationType: eduType,
      gradeLevel: eduGrade.trim(),
      fieldOfStudy: eduField.trim(),
      startDate: eduStartDate,
      endDate: eduEndDate,
      description: eduDesc.trim()
    };

    const updated = [newRecord, ...educationHistory];
    setEducationHistory(updated);
    setNewEduModalOpen(false);

    // Reset inputs
    setEduInstName('');
    setEduGrade('');
    setEduField('');
    setEduStartDate('');
    setEduEndDate('');
    setEduDesc('');

    await updateUserProfileData(currentUser.id, { educationHistory: updated });
    if (onUpdateUser) onUpdateUser({ ...currentUser, educationHistory: updated });
  };

  // Delete Education Record
  const handleDeleteEduRecord = async (id: string) => {
    if (!currentUser) return;
    const updated = educationHistory.filter(e => e.id !== id);
    setEducationHistory(updated);
    await updateUserProfileData(currentUser.id, { educationHistory: updated });
    if (onUpdateUser) onUpdateUser({ ...currentUser, educationHistory: updated });
  };

  // Upload Educational Document
  const handleUploadDoc = async () => {
    if (!docFile || !docTitle.trim() || !currentUser) return;
    setUploadingDoc(true);
    setErrorMessage(null);
    try {
      const { downloadUrl, storagePath } = await uploadProfileFile(currentUser.id, docFile, 'documents');
      
      const updatedDocs = await saveCustomerDocument(
        currentUser.id,
        {
          userId: currentUser.id,
          documentType: docType,
          title: docTitle.trim(),
          description: docDescription.trim(),
          institution: docInstitution.trim(),
          issueDate: docIssueDate,
          fileName: docFile.name,
          mimeType: docFile.type,
          fileSize: docFile.size,
          fileUrl: downloadUrl,
          storagePath,
          uploadedBy: currentUser.email || currentUser.id,
          visibility: 'PRIVATE'
        },
        documents
      );

      setDocuments(updatedDocs);
      setDocModalOpen(false);
      setDocTitle('');
      setDocInstitution('');
      setDocIssueDate('');
      setDocDescription('');
      setDocFile(null);

      if (onUpdateUser) onUpdateUser({ ...currentUser, documents: updatedDocs });
    } catch (err: any) {
      console.error('Doc upload error:', err);
      setErrorMessage(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Delete Educational Document
  const handleDeleteDoc = async (docId: string) => {
    if (!currentUser) return;
    try {
      const updated = await deleteCustomerDocument(currentUser.id, docId, documents);
      setDocuments(updated);
      if (onUpdateUser) onUpdateUser({ ...currentUser, documents: updated });
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Identity Document (Private)
  const handleUploadIdentityDoc = async () => {
    if (!idFile || !currentUser) return;
    setUploadingId(true);
    setErrorMessage(null);
    try {
      const { downloadUrl, storagePath } = await uploadProfileFile(currentUser.id, idFile, 'identity');
      
      const updated = await saveCustomerIdentityDocument(
        currentUser.id,
        {
          userId: currentUser.id,
          identityType: idType,
          documentNumber: idNumber.trim(),
          fileName: idFile.name,
          mimeType: idFile.type,
          fileSize: idFile.size,
          fileUrl: downloadUrl,
          storagePath
        },
        identityDocs
      );

      setIdentityDocs(updated);
      setIdentityModalOpen(false);
      setIdNumber('');
      setIdFile(null);

      if (onUpdateUser) onUpdateUser({ ...currentUser, identityDocuments: updated });
    } catch (err: any) {
      console.error('Identity doc upload error:', err);
      setErrorMessage(err.message || 'Failed to upload identity document.');
    } finally {
      setUploadingId(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          {isArabic ? 'يرجى تسجيل الدخول للوصول إلى الملف الشخصي' : 'Please Sign In to Access Your Profile'}
        </h2>
        <p className="text-slate-500 mb-6">
          {isArabic ? 'ملفك الشخصي محمي ويتطلب مصادقة حساب سمارتك' : 'Your customer profile is protected and requires SmartTech authentication.'}
        </p>
      </div>
    );
  }

  // Filter Enrolled Courses
  const enrolledCourses = courses.filter(c => currentUser.enrolledCourseIds?.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ============================================================ */}
      {/* 1. TOP HEADER BANNER & PROFILE OVERVIEW                       */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar & Upload Trigger */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/20 bg-slate-800 shadow-xl flex items-center justify-center text-3xl font-black text-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-400" />
              )}
            </div>
            <button
              onClick={() => setActiveSubTab('photo')}
              className="absolute -bottom-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
              title={isArabic ? 'تغيير الصورة الشخصية' : 'Change Profile Photo'}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{currentUser.name}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-600/30 text-red-300 border border-red-500/30">
                {currentUser.role}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Level {currentUser.level || 1} • {currentUser.xp || 0} XP
              </span>
            </div>

            <p className="text-sm text-slate-300 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{currentUser.email}</span>
              {currentUser.phone && (
                <>
                  <span className="text-slate-600">•</span>
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.phone}</span>
                </>
              )}
            </p>

            {/* Profile Completion Indicator */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-300">
                  {isArabic ? 'مستوى اكتمال الملف الشخصي' : 'Profile Completion'}
                </span>
                <span className="text-amber-400">{completion.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-red-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              {completion.missingFields.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {isArabic ? 'ينقصك: ' : 'Missing: '}{completion.missingFields.slice(0, 2).join(' • ')}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xl font-black text-amber-400">{enrolledCourses.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">{isArabic ? 'كورس مسجل' : 'Enrolled Courses'}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xl font-black text-emerald-400">{documents.filter(d => d.verificationStatus === 'VERIFIED').length}</div>
              <div className="text-[11px] text-slate-300 font-medium">{isArabic ? 'وثائق معتمدة' : 'Verified Docs'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-sm">
              {isArabic ? 'تم حفظ بيانات الملف الشخصي بنجاح!' : 'Profile updated successfully!'}
            </span>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-500/30 text-red-800 dark:text-red-200 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUB-NAVIGATION TABS BAR                                   */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', labelAr: 'نظرة عامة والتعلم', labelEn: 'Overview & Learning', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'personal', labelAr: 'البيانات الشخصية', labelEn: 'Personal Info', icon: <UserIcon className="w-4 h-4" /> },
          { id: 'photo', labelAr: 'الصورة الشخصية', labelEn: 'Profile Photo', icon: <Camera className="w-4 h-4" /> },
          { id: 'address', labelAr: 'العنوان والسكن', labelEn: 'Address', icon: <MapPin className="w-4 h-4" /> },
          { id: 'education', labelAr: 'التعليم والشهادات الخارجيّة', labelEn: 'Education & External Docs', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'identity', labelAr: 'وثائق الهوية (خاصة)', labelEn: 'Identity Docs (Private)', icon: <Lock className="w-4 h-4" /> },
          { id: 'certificates', labelAr: 'شهادات سمارتك الرسمية', labelEn: 'SmartTech Certificates', icon: <Award className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: OVERVIEW & CONNECTED LEARNING DATA                  */}
      {/* ============================================================ */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Enrolled Courses & History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  <span>{isArabic ? 'الكورسات المسجلة والنشطة' : 'Enrolled & Active Courses'}</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">{enrolledCourses.length} {isArabic ? 'كورس' : 'Courses'}</span>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
                      {course.image ? (
                        <img src={course.image} alt={course.titleAr} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black">
                          ST
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{isArabic ? course.titleAr : course.titleEn}</h4>
                        <p className="text-xs text-slate-500">{course.ageCategory || 'All Ages'}</p>
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'مسجل بنجاح' : 'Enrolled'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">{isArabic ? 'لم تقم بالتسجيل في أي كورس حتى الآن.' : 'You are not enrolled in any courses yet.'}</p>
                  {onNavigateToTab && (
                    <button 
                      onClick={() => onNavigateToTab('courses')} 
                      className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 cursor-pointer"
                    >
                      {isArabic ? 'تصفح الكورسات المتاحة' : 'Explore Courses'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Attendance & Performance Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>{isArabic ? 'سجل الحضور والتقييمات' : 'Attendance & Exam Records'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <div className="text-2xl font-black text-emerald-600">100%</div>
                  <div className="text-xs text-slate-500">{isArabic ? 'نسبة الحضور' : 'Attendance'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <div className="text-2xl font-black text-amber-500">{currentUser.xp || 0}</div>
                  <div className="text-xs text-slate-500">{isArabic ? 'نقاط XP' : 'Total XP'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <div className="text-2xl font-black text-purple-500">{currentUser.level || 1}</div>
                  <div className="text-xs text-slate-500">{isArabic ? 'المستوى' : 'Level'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <div className="text-2xl font-black text-blue-500">{currentUser.badges?.length || 0}</div>
                  <div className="text-xs text-slate-500">{isArabic ? 'الشارات' : 'Badges'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info & Contact */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
                {isArabic ? 'معلومات الاتصال المعتمدة' : 'Contact Summary'}
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span>{phone || (isArabic ? 'غير محدد' : 'Not set')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>{whatsappNumber || (isArabic ? 'غير محدد' : 'Not set')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{address.city}, {address.country}</span>
                </li>
              </ul>
              <button
                onClick={() => setActiveSubTab('personal')}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isArabic ? 'تحديث المعلومات' : 'Edit Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 2: PERSONAL INFORMATION                               */}
      {/* ============================================================ */}
      {activeSubTab === 'personal' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isArabic ? '1. المعلومات الشخصية والمعلومات الأساسية' : 'Personal Information'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic ? 'قم بتعديل بياناتك الشخصية للتوثيق وإصدار الشهادات الرسمية' : 'Update your personal details for verification and certificate issuance.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'الاسم الأول *' : 'First Name *'}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'اسم العائلة *' : 'Last Name *'}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'اسم العرض في الشهادة والمنصة' : 'Display Name'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'الجنس' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              >
                <option value="MALE">{isArabic ? 'ذكر' : 'Male'}</option>
                <option value="FEMALE">{isArabic ? 'أنثى' : 'Female'}</option>
                <option value="PREFER_NOT_TO_SAY">{isArabic ? 'أفضل عدم التحديد' : 'Prefer not to say'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'البريد الإلكتروني (غير قابل للتعديل)' : 'Email Address (Read-only)'}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'رقم الهاتف الرئيسي *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="+966 50 000 0000"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isArabic ? 'رقم الواتساب' : 'WhatsApp Number'}
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                disabled={isPhoneAndWhatsappSame}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="+966 50 000 0000"
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium ${
                  isPhoneAndWhatsappSame 
                    ? 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              />
              <label className="mt-2 flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isPhoneAndWhatsappSame}
                  onChange={e => {
                    setIsPhoneAndWhatsappSame(e.target.checked);
                    if (e.target.checked) setWhatsappNumber(phone);
                  }}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>{isArabic ? 'رقم الهاتف ورقم الواتساب هما نفس الرقم' : 'Phone and WhatsApp are the same'}</span>
              </label>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-md font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>{isArabic ? 'جهة الاتصال عند الطوارئ' : 'Emergency Contact'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'اسم شخص الطوارئ' : 'Contact Name'}</label>
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={e => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'صلة القرابة' : 'Relationship'}</label>
                <input
                  type="text"
                  value={emergencyContact.relation}
                  onChange={e => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'رقم هاتف الطوارئ' : 'Emergency Phone'}</label>
                <input
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSavePersonalInfo}
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black rounded-2xl shadow-xl shadow-red-600/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ البيانات الشخصية' : 'Save Personal Info')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 3: PROFILE PHOTO MANAGEMENT                          */}
      {/* ============================================================ */}
      {activeSubTab === 'photo' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isArabic ? '2. إدارة الصورة الشخصية والخصوصية' : 'Profile Photo & Visibility'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic ? 'يمكنك رفع صورة شخصية مباشرة من جهازك (JPG, PNG, WEBP). لا يتطلب روابط خارجيّة.' : 'Upload profile picture directly from your device. No external URLs needed.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="relative w-40 h-40 rounded-3xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-20 h-20 text-slate-400" />
              )}
            </div>

            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileSelected}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingPhoto ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'رفع صورة من الجهاز' : 'Upload From Device')}</span>
              </button>

              {avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isArabic ? 'مستوى رؤية الصورة الشخصية' : 'Photo Visibility Settings'}
            </label>
            <select
              value={photoVisibility}
              onChange={e => setPhotoVisibility(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium"
            >
              <option value="PRIVATE">{isArabic ? 'خاصة (أنا فقط والمديرين)' : 'Private (Me & Staff only)'}</option>
              <option value="ACCOUNT_ONLY">{isArabic ? 'حسابي فقط' : 'Account Only'}</option>
              <option value="TEACHERS_STAFF">{isArabic ? 'المعلمون والمدربون المعتمدون' : 'Teachers & Staff'}</option>
              <option value="CLASS">{isArabic ? 'زملاء الفصل والجروب' : 'Classmates'}</option>
              <option value="PUBLIC">{isArabic ? 'عامة' : 'Public'}</option>
            </select>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. TAB 4: ADDRESS DETAILS                                    */}
      {/* ============================================================ */}
      {activeSubTab === 'address' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isArabic ? '3. بيانات العنوان والموقع الجغرافي' : 'Address Details'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'الدولة' : 'Country'}</label>
              <input
                type="text"
                value={address.country}
                onChange={e => setAddress({ ...address, country: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'المنطقة / المحافظة' : 'Governorate / State'}</label>
              <input
                type="text"
                value={address.governorate || ''}
                onChange={e => setAddress({ ...address, governorate: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'المدينة' : 'City'}</label>
              <input
                type="text"
                value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'المنطقة / الحي' : 'Area / Neighborhood'}</label>
              <input
                type="text"
                value={address.area || ''}
                onChange={e => setAddress({ ...address, area: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'الشارع' : 'Street'}</label>
              <input
                type="text"
                value={address.street || ''}
                onChange={e => setAddress({ ...address, street: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'الرمز البريدي' : 'Postal Code'}</label>
              <input
                type="text"
                value={address.postalCode || ''}
                onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSavePersonalInfo}
              disabled={saving}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ العنوان' : 'Save Address'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TAB 5: EDUCATION & EXTERNAL DOCUMENTS                      */}
      {/* ============================================================ */}
      {activeSubTab === 'education' && (
        <div className="space-y-6 max-w-5xl">
          {/* Education Records */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {isArabic ? '4. السجل التعليمي والخبرات' : 'Education Profile'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isArabic ? 'أضف المدارس، الجامعات، أو المعاهد والشهادات التي حصلت عليها' : 'Add schools, universities, or training centers.'}
                </p>
              </div>
              <button
                onClick={() => setNewEduModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? 'إضافة سجل تعليمي' : 'Add Education'}</span>
              </button>
            </div>

            {educationHistory.length > 0 ? (
              <div className="space-y-4">
                {educationHistory.map(edu => (
                  <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-600 uppercase">
                          {edu.educationType}
                        </span>
                        <h4 className="font-black text-slate-900 dark:text-white text-base">{edu.institutionName}</h4>
                      </div>
                      {edu.gradeLevel && <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{isArabic ? 'المرحلة / الصف: ' : 'Grade: '}{edu.gradeLevel}</p>}
                      {edu.fieldOfStudy && <p className="text-xs text-slate-500">{isArabic ? 'التخصص: ' : 'Field: '}{edu.fieldOfStudy}</p>}
                      {edu.startDate && <p className="text-[11px] text-slate-400">{edu.startDate} - {edu.endDate || (isArabic ? 'حتى الآن' : 'Present')}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteEduRecord(edu.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{isArabic ? 'لم تقم بفيض بيانات تعليمية بعد.' : 'No education records added yet.'}</p>
              </div>
            )}
          </div>

          {/* Educational Documents Section (Private & Protected) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {isArabic ? 'الشهادات والمستندات التعليمية المرفوعة' : 'Uploaded Educational Documents'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PRIVATE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isArabic ? 'مستنداتك محمية تماماً وخاصة، ولا تنشر للعامة.' : 'Your educational documents are private and encrypted.'}
                </p>
              </div>
              <button
                onClick={() => setDocModalOpen(true)}
                className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>{isArabic ? 'رفع شهادة / بيان' : 'Upload Certificate'}</span>
              </button>
            </div>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.documentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-red-500 uppercase">{doc.documentType}</span>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{doc.title}</h4>
                        {doc.institution && <p className="text-xs text-slate-500">{doc.institution}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-600' :
                        doc.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-600' :
                        'bg-amber-500/20 text-amber-600'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </div>

                    {doc.fileUrl && (
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'معاينة المستند المحمي' : 'View Document'}</span>
                      </a>
                    )}

                    {doc.rejectionReason && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl">
                        {isArabic ? 'سبب الرفض: ' : 'Reason: '}{doc.rejectionReason}
                      </p>
                    )}

                    <div className="flex justify-end pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <button 
                        onClick={() => handleDeleteDoc(doc.documentId)}
                        className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'حذف' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{isArabic ? 'لا توجد شهادات خارجية مرفوعة.' : 'No external certificates uploaded.'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. TAB 6: PRIVATE IDENTITY DOCUMENTS                         */}
      {/* ============================================================ */}
      {activeSubTab === 'identity' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {isArabic ? '5. وثائق الهوية والتحقق (سرّي للغاية)' : 'Identity & Verification Documents'}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> STRICTLY PRIVATE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isArabic ? 'الهوية الوطنية، الجواز، أو بطاقة الطالب. لا يمكن لأحد الاطلاع عليها باستثناء مدير النظام المعتمد.' : 'National ID, Passport, or Student Card. Accessible only by authorized staff with VIEW_PRIVATE_IDENTITY_DOCUMENTS permission.'}
              </p>
            </div>
            <button
              onClick={() => setIdentityModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>{isArabic ? 'رفع وثيقة إثبات هوية' : 'Upload Identity Doc'}</span>
            </button>
          </div>

          {identityDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {identityDocs.map(idDoc => (
                <div key={idDoc.documentId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-red-500">{idDoc.identityType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      idDoc.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                    }`}>
                      {idDoc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">{idDoc.fileName}</p>
                  {idDoc.documentNumber && <p className="text-xs text-slate-500">{isArabic ? 'رقم الوثيقة: ' : 'ID Number: '}{idDoc.documentNumber}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Lock className="w-12 h-12 mx-auto mb-2 opacity-50 text-red-500" />
              <p className="text-sm font-medium">{isArabic ? 'لم تقم برفع أية وثائق اثبات هوية بعد.' : 'No identity documents uploaded.'}</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. TAB 7: OFFICIAL SMARTTECH CERTIFICATES                     */}
      {/* ============================================================ */}
      {activeSubTab === 'certificates' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>{isArabic ? '6. شهادات أصلية صادرة من أكاديمية سمارتك' : 'SmartTech Official Certificates'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic ? 'الشهادات المعتمدة من سمارتك الموصلة برقم مسلسل ورابط تحقق محمي.' : 'Official SmartTech verified certificates with unique serial numbers.'}
            </p>
          </div>

          <div className="text-center py-10 space-y-3">
            <Award className="w-16 h-16 mx-auto text-amber-500 animate-pulse" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {isArabic ? 'عند إكمال أي كورس بنجاح، ستظهر شهادتك الرسمية هنا مع رابط التحقق الفوري.' : 'Upon course completion, your official certificate will appear here with instant verification links.'}
            </p>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('verify')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isArabic ? 'الذهاب لخدمة التحقق من الشهادات' : 'Go to Certificate Verification Service'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD EDUCATION RECORD                                  */}
      {/* ============================================================ */}
      {newEduModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{isArabic ? 'إضافة سجل تعليمي' : 'Add Education Record'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'اسم المؤسسة *' : 'Institution Name *'}</label>
                <input
                  type="text"
                  value={eduInstName}
                  onChange={e => setEduInstName(e.target.value)}
                  placeholder="e.g. King Saud University / Al-Nokhba School"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'نوع المؤسسة' : 'Type'}</label>
                  <select
                    value={eduType}
                    onChange={e => setEduType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                  >
                    <option value="SCHOOL">School</option>
                    <option value="UNIVERSITY">University</option>
                    <option value="INSTITUTE">Institute</option>
                    <option value="TRAINING_CENTER">Training Center</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'المرحلة / المستوى' : 'Grade / Level'}</label>
                  <input
                    type="text"
                    value={eduGrade}
                    onChange={e => setEduGrade(e.target.value)}
                    placeholder="e.g. Grade 10 / Bachelor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'التخصص' : 'Field of Study'}</label>
                <input
                  type="text"
                  value={eduField}
                  onChange={e => setEduField(e.target.value)}
                  placeholder="e.g. Computer Science / Robotics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setNewEduModalOpen(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">{isArabic ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleAddEducationRecord} className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black">{isArabic ? 'إضافة' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPLOAD EDUCATIONAL CERTIFICATE                         */}
      {/* ============================================================ */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{isArabic ? 'رفع مستند / شهادة تعليمية' : 'Upload Educational Document'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'عنوان الشهادة / الوثيقة *' : 'Title *'}</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g. High School Diploma / Python Certificate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'نوع الوثيقة' : 'Document Type'}</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                  >
                    <option value="SCHOOL_CERTIFICATE">School Certificate</option>
                    <option value="STATEMENT">Statement / Transcript</option>
                    <option value="UNIVERSITY_DEGREE">University Degree</option>
                    <option value="TRAINING_CERTIFICATE">Training Certificate</option>
                    <option value="DIPLOMA">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'اسم الجهة الصادرة' : 'Institution'}</label>
                  <input
                    type="text"
                    value={docInstitution}
                    onChange={e => setDocInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'اختيار الملف من الجهاز' : 'Select File'}</label>
                <input
                  type="file"
                  onChange={e => setDocFile(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="w-full text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDocModalOpen(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">{isArabic ? 'إلغاء' : 'Cancel'}</button>
              <button 
                onClick={handleUploadDoc} 
                disabled={uploadingDoc || !docFile}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black disabled:opacity-50"
              >
                {uploadingDoc ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'رفع وتأكيد' : 'Upload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPLOAD PRIVATE IDENTITY DOCUMENT                       */}
      {/* ============================================================ */}
      {identityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              <span>{isArabic ? 'رفع وثيقة إثبات هوية (محمية)' : 'Upload Private Identity Document'}</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'نوع الوثيقة' : 'Identity Type'}</label>
                <select
                  value={idType}
                  onChange={e => setIdType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                >
                  <option value="NATIONAL_ID">National ID / الإقامة أو الهوية الوطنية</option>
                  <option value="PASSPORT">Passport / جواز السفر</option>
                  <option value="STUDENT_ID">Student ID / بطاقة الطالب</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'رقم الوثيقة (اختياري)' : 'Document Number'}</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{isArabic ? 'صورة أو ملف الوثيقة من جهازك' : 'File'}</label>
                <input
                  type="file"
                  onChange={e => setIdFile(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="w-full text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIdentityModalOpen(false)} className="px-4 py-2 text-slate-500 text-xs font-bold">{isArabic ? 'إلغاء' : 'Cancel'}</button>
              <button 
                onClick={handleUploadIdentityDoc} 
                disabled={uploadingId || !idFile}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black disabled:opacity-50"
              >
                {uploadingId ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'تأكيد الرفع السري' : 'Upload Securely')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
