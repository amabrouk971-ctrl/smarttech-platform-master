export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ATTENDEE = 'ATTENDEE',
  PARENT = 'PARENT',
  GUEST = 'GUEST'
}

export type ApprovalStatus = 'PENDING_APPROVAL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type DataScope = 'ALL' | 'BRANCH' | 'COURSE' | 'GROUP' | 'SESSION' | 'ASSIGNED_STUDENTS' | 'OWN_DATA' | 'LINKED_CHILDREN';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  pageAccess: string[];
  dataScope: DataScope;
  createdBy: string;
  createdAt: string;
}

export interface TeacherWorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface TeacherPortfolioItem {
  id: string;
  title: string;
  type: 'CV' | 'CERTIFICATE' | 'PROJECT' | 'VIDEO' | 'DOCUMENT' | 'LINK';
  url: string;
  visibility: 'PRIVATE' | 'ADMIN_ONLY' | 'PUBLIC_PROFILE';
  createdAt: string;
}

export interface TeacherProfile {
  qualifications: string;
  specializations: string[];
  yearsOfExperience: number;
  currentWorkplace?: string;
  bio?: string;
  workHistory: TeacherWorkExperience[];
  portfolioItems: TeacherPortfolioItem[];
  requestedCourses: string[];
  assignedCourses?: string[];
  reviewNotes?: string;
}

export interface StudentProfile {
  birthDate?: string;
  emergencyContact?: string;
  school?: string;
  city?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  educationLevel?: string;
  qrToken?: string;
  qrTokenCreatedAt?: string;
  qrStatus?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
}

export enum UserMode {
  KIDS = 'KIDS',
  ADULT = 'ADULT'
}

export interface ParentStudentRelationship {
  id: string;
  parentId: string;
  studentId: string;
  relationshipType: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  source: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  groupId?: string;
  teacherId: string;
  branchId?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  examEnabled: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  courseId: string;
  groupId?: string;
  teacherId: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  method: 'QR' | 'MANUAL';
  timestamp: string;
  recordedBy: string;
}

export interface ConcentrationRecord {
  id: string;
  studentId: string;
  sessionId: string;
  teacherId: string;
  courseId: string;
  groupId?: string;
  score: number;
  scale: number;
  teacherNoteVisibility: 'PRIVATE' | 'VISIBLE_TO_PARENT';
  teacherFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  studentId: string;
  parentId: string;
  teacherId: string;
  courseId?: string;
  groupId?: string;
  createdAt: string;
  lastMessageAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: 'TEXT' | 'NOTIFICATION' | 'QUESTION' | 'NOTE' | 'REQUEST';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  studentId?: string;
  courseId?: string;
  sessionId?: string;
  createdAt: string;
  readAt?: string;
  status: 'UNREAD' | 'READ';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  mode: UserMode;
  approvalStatus?: ApprovalStatus;
  avatar?: string;
  age?: number;
  phone?: string;
  xp: number;
  level: number;
  levelTitle: string;
  badges: string[];
  childIds?: string[];
  enrolledCourseIds: string[];
  enrolledPathIds: string[];
  customRoleId?: string;
  permissions?: string[];
  pagePermissions?: string[];
  assignedScope?: {
    branchIds?: string[];
    courseIds?: string[];
    groupIds?: string[];
  };
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
  qrToken?: string;
  qrStatus?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  branchId?: string;
}

export interface LearningPathStage {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  skills: string[];
  image?: string;
  projectOutcomeAr?: string;
}

export interface LearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  ageRange: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  iconName: string;
  image?: string;
  personalityType?: 'assembly_engineering' | 'gaming_programming' | 'ai_shared' | 'creative_design' | 'math_iq';
  personalityLabelAr?: string;
  stages: LearningPathStage[];
  targetAudienceAr: string;
  targetAudienceEn: string;
  estimatedWeeks: number;
  badgeReward: string;
}

export type CourseCategory =
  | 'programming'
  | 'robotics'
  | 'ai'
  | 'electronics'
  | 'stem'
  | 'diploma'
  | 'arts'
  | 'english'
  | 'accounting'
  | 'business';

export interface CourseSessionSchedule {
  sessionNumber: number;
  titleAr: string;
  startDate?: string;
  startTime?: string;
  descriptionAr?: string;
}

export interface CourseModule {
  id: string;
  titleAr: string;
  titleEn?: string;
  lessonsCount?: number;
  topicsAr?: string[];
}

export interface LearningDNA {
  userType?: string;
  age?: number;
  interests: string[];
  computerExperience: string;
  aiExperience: string;
  goals: string[];
  learningStyles: string[];
  recommendedTrackIds?: string[];
  primaryPathId?: string;
  secondaryPathId?: string;
  nextCourseId?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: CourseCategory;
  ageMin: number;
  ageMax: number;
  originalPrice: number;
  discountPrice: number;
  summer3MonthsPrice?: number;
  monthlyPrice?: number;
  durationWeeks: number;
  sessionsCount: number;
  sessionMinutes: number;
  descriptionAr: string;
  descriptionEn: string;
  learningOutcomesAr: string[];
  learningOutcomesEn: string[];
  skills: string[];
  kitPrice?: number;
  kitNameAr?: string;
  mode: 'Online' | 'Center' | 'Hybrid';
  branchNameAr?: string;
  image: string;
  levelAr: string;
  featured?: boolean;
  startDate?: string;
  currency?: string;
  sessionSchedules?: CourseSessionSchedule[];
  modules?: CourseModule[];
  interests?: string[];
  tags?: string[];
  learning_styles?: string[];
  learning_path?: string;
  recommendation_weight?: number;
  market_demand_score?: number;
  ai_relevance_score?: number;
  digital_employee_relevance_score?: number;
  career_paths?: string[];
  prerequisites?: string[];
  recommended_before?: string[];
  recommended_after?: string[];
  related_courses?: string[];
  next_courses?: string[];
  learning_paths?: string[];
  accessMode?: 'PUBLIC_PREVIEW' | 'REGISTERED_ONLY' | 'ACADEMY_ONLY' | 'ENROLLED_ONLY' | 'PRIVATE';
  status?: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED' | 'COMING_SOON';
  bannerImage?: string;
  thumbnailImage?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  enrollmentFee?: number;
  optionalMaterialsFee?: number;
}

// ==========================================
// TRANSACTIONS, REVENUE & ACADEMY MEMBERSHIPS
// ==========================================

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Transaction {
  id: string;
  transactionId: string;
  studentId: string;
  studentName?: string;
  parentId?: string;
  parentName?: string;
  courseId?: string;
  courseTitleAr?: string;
  pathId?: string;
  pathTitleAr?: string;
  amount: number;
  currency: string;
  discount: number;
  finalAmount: number;
  paymentMethod: 'CASH' | 'FAWRY' | 'VODAFONE_CASH' | 'BANK_TRANSFER' | 'CARD' | 'INSTAPAY';
  paymentStatus: PaymentStatus;
  transactionDate: string;
  enrollmentId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type AcademyMembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED';

export interface AcademyMembership {
  id: string;
  userId: string;
  studentId: string;
  studentName?: string;
  parentId?: string;
  parentName?: string;
  status: AcademyMembershipStatus;
  membershipType: 'REGULAR' | 'PREMIUM' | 'SCHOLARSHIP' | 'VIP';
  startDate: string;
  endDate: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  updatedAt?: string;
}

export type ExtendedLeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'INTERESTED' 
  | 'FOLLOW_UP'
  | 'COURSE_SELECTED'
  | 'OFFER_SENT'
  | 'PAYMENT_PENDING' 
  | 'PAID'
  | 'ENROLLED' 
  | 'NOT_INTERESTED' 
  | 'NO_RESPONSE'
  | 'LOST' 
  | 'CANCELLED'
  | 'REJECTED';

export type LeadStatus = ExtendedLeadStatus;

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadSource = 
  | 'Website' 
  | 'WhatsApp' 
  | 'Phone' 
  | 'Facebook' 
  | 'Instagram' 
  | 'TikTok' 
  | 'Walk-in' 
  | 'Referral' 
  | 'Admin' 
  | 'Coordinator' 
  | 'Other';

export interface Lead {
  id: string;
  leadId: string;
  fullName?: string;
  parentName: string;
  studentName: string;
  phone: string;
  whatsappNumber: string;
  email?: string;
  childDateOfBirth?: string;
  childAge?: number;
  studentAge?: number;
  studentDateOfBirth?: string;
  source: LeadSource | string;
  interestedCourseIds?: string[];
  interestedPathIds?: string[];
  selectedPath?: string;
  selectedPathTitle?: string;
  selectedCourses: string[];
  selectedCourseTitles?: string[];
  interests?: string[];
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedBy?: string;
  assignedAt?: string;
  createdBy: string;
  createdByName?: string;
  status: ExtendedLeadStatus;
  priority?: LeadPriority;
  notes?: string;
  nextFollowUpAt?: string;
  lastContactAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Backward compatibility
  assignedStaff?: string;
  followUpDate?: string;
  adminNotes?: string;
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type EmployeeRole = 'ADMIN' | 'COORDINATOR' | 'SALES' | 'RECEPTION' | 'CUSTOM';

export interface Employee {
  id: string; // employeeId (e.g. EMP-1001)
  employeeId: string;
  userId?: string; // Firebase Auth UID
  fullName: string;
  profileImage?: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  jobTitle: string;
  department: string;
  branch: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface LeadAssignmentHistory {
  id: string;
  leadId: string;
  previousEmployeeId?: string;
  previousEmployeeName?: string;
  newEmployeeId: string;
  newEmployeeName: string;
  changedBy: string;
  changedByName?: string;
  reason: string;
  createdAt: string;
}

export type CallDirection = 'OUTBOUND' | 'INBOUND' | 'MISSED';
export type CallResult = 'ANSWERED' | 'NO_ANSWER' | 'BUSY' | 'CALLBACK_REQUESTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'WRONG_NUMBER' | 'ENROLLED' | 'OTHER';

export interface LeadCall {
  id: string;
  callId: string;
  leadId: string;
  employeeId: string;
  employeeName?: string;
  callDate: string;
  duration?: string;
  direction: CallDirection;
  result: CallResult;
  notes: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

export type MessageChannel = 'WhatsApp' | 'Phone' | 'SMS' | 'Email' | 'Facebook' | 'Instagram' | 'Website' | 'Other';

export interface LeadMessage {
  id: string;
  messageId: string;
  leadId: string;
  employeeId: string;
  employeeName?: string;
  channel: MessageChannel;
  direction: 'OUTBOUND' | 'INBOUND';
  messageSummary: string;
  messageTimestamp: string;
  attachments?: string[];
  createdAt: string;
}

export type FollowUpType = 'CALL' | 'WHATSAPP' | 'MESSAGE' | 'EMAIL' | 'MEETING' | 'OTHER';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export interface LeadFollowUp {
  id: string;
  followUpId: string;
  leadId: string;
  leadName?: string;
  studentName?: string;
  phone?: string;
  employeeId: string;
  employeeName?: string;
  followUpDate: string;
  followUpType: FollowUpType;
  notes: string;
  status: FollowUpStatus;
  priority?: LeadPriority;
  createdAt: string;
  completedAt?: string;
}

export interface CRMNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'LEAD_ASSIGNED' | 'LEAD_TRANSFERRED' | 'FOLLOWUP_DUE' | 'ENROLLMENT_SUCCESS';
  leadId?: string;
  read: boolean;
  createdAt: string;
}

export interface CourseImage {
  imageId: string;
  courseId?: string;
  pathId?: string;
  type: 'cover' | 'thumbnail' | 'banner' | 'icon' | 'general';
  storagePath: string;
  downloadUrl: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}


export interface Mission {
  id: string;
  titleAr: string;
  titleEn: string;
  pathId: string;
  xpReward: number;
  type: 'scratch' | 'arduino' | 'python' | 'ai_training' | 'circuit_simulation' | 'quiz';
  descriptionAr: string;
  descriptionEn: string;
  hintsAr: string[];
  initialCodeOrCircuit?: string;
  goalAr: string;
  isCompleted?: boolean;
}

export interface Badge {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  category: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  age: number;
  pathId: string;
  completedMissions: string[];
  totalXp: number;
  level: number;
  levelTitle: string;
  strengthsAr: string[];
  areasToImproveAr: string[];
  weeklyActivityHours: number;
  attendanceRate: number;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  studentNameAr: string;
  studentNameEn: string;
  courseTitleAr: string;
  courseTitleEn: string;
  issueDate: string;
  instructorNameAr: string;
  pathTitleAr: string;
  qrUrl: string;
}

export interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  availableSeats: number;
  maxCapacity: number;
  workingHoursAr: string;
  mapEmbedUrl?: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
}

export interface StoreItem {
  id: string;
  nameAr: string;
  titleAr?: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  category: 'kits' | 'electronics' | 'robotics' | 'books';
  categoryAr?: string;
  inStock: boolean;
}

export interface StudentProject {
  id: string;
  titleAr: string;
  studentFirstName: string;
  age: number;
  courseTitleAr: string;
  skills: string[];
  imageUrl: string;
  likesCount: number;
  demoUrl?: string;
  createdAt: string;
}

// ==========================================
// FULL DYNAMIC LMS & CMS DATA TYPES (FIRESTORE)
// ==========================================

export type ExamType = 'QUIZ' | 'TEST' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'ASSESSMENT' | 'CHALLENGE';
export type ResultVisibility = 'IMMEDIATE' | 'AFTER_REVIEW' | 'SCHEDULED' | 'NEVER';
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'CODE';
export type TargetType = 'EVERYONE' | 'STUDENT' | 'GROUP' | 'COURSE' | 'ROLE';

export interface ContentTarget {
  type: TargetType;
  targetIds?: string[]; // Array of student IDs, group names, course IDs, or roles
}

export interface Exam {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  courseId?: string;
  examType: ExamType;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  durationMinutes: number; // 0 for unlimited
  maxAttempts: number; // 0 for unlimited
  passingScore: number; // e.g. 70 (%)
  totalPoints: number;
  gradingEnabled: boolean;
  resultVisibility: ResultVisibility;
  showScore: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  target: ContentTarget;
  startAt?: string;
  endAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  textAr: string;
  textEn?: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  type: QuestionType;
  questionAr: string;
  questionEn?: string;
  options?: QuestionOption[];
  correctAnswerIds?: string[]; // e.g. ["B"]
  textAnswerKey?: string;
  points: number;
  negativePoints?: number;
  explanationAr?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ExamAttemptAnswer {
  questionId: string;
  selectedAnswerIds?: string[];
  textAnswer?: string;
  pointsAwarded?: number;
  isGraded?: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  submittedAt?: string;
  attemptNumber: number;
  status: 'STARTED' | 'SUBMITTED' | 'PENDING_REVIEW' | 'GRADED';
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: ExamAttemptAnswer[];
}

export interface Assignment {
  id: string;
  titleAr: string;
  descriptionAr: string;
  courseId?: string;
  deadline?: string;
  maxScore: number;
  target: ContentTarget;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionText?: string;
  attachmentUrl?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED';
}

export interface ProjectSubmission {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  courseId?: string;
  submittedAt: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export interface Announcement {
  id: string;
  titleAr: string;
  contentAr: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  target: ContentTarget;
  publishedAt: string;
  expiresAt?: string;
}

export interface CourseMaterial {
  id: string;
  titleAr: string;
  descriptionAr?: string;
  courseId?: string;
  fileUrl: string;
  fileType: 'PDF' | 'VIDEO' | 'DOC' | 'ZIP' | 'LINK';
  target: ContentTarget;
  createdAt: string;
}

export type SimulationType = 
  'CIRCUIT_BUILDER' | 'ARDUINO_LAB' | 'ESP32_LAB' | 'ROBOT_BUILDER' | 
  'BLOCK_PROGRAMMING' | 'CODE_LAB' | 'AI_EXPERIMENT' | 'DRAG_DROP' | 
  'LOGIC_CHALLENGE' | 'PHYSICS_SIMULATION' | 'ENGINEERING_BUILDER' | 
  '3D_WORLD' | 'SCENARIO_SIMULATION' | 'PUZZLE' | 'CHALLENGE';

export interface SimulationComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
  properties: Record<string, any>;
}

export interface SimulationRule {
  id: string;
  condition: string;
  action: string;
}

export interface SimulationDef {
  id: string;
  titleAr: string;
  descriptionAr?: string;
  type: SimulationType;
  difficulty: 'BEGINNER' | 'EASY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  components: SimulationComponent[];
  rules: SimulationRule[];
  target: ContentTarget;
  createdAt: string;
}



// ==========================================
// EVENT ENGINE & AUTOMATION TYPES
// ==========================================
export type EventType = 
  | 'ATTENDANCE_PRESENT' 
  | 'ATTENDANCE_LATE' 
  | 'ATTENDANCE_ABSENT'
  | 'EXAM_SUBMITTED' 
  | 'EXAM_GRADED' 
  | 'CONCENTRATION_RECORDED'
  | 'MESSAGE_RECEIVED'
  | 'ANNOUNCEMENT_CREATED'
  | 'SESSION_COMPLETED'
  | 'BIRTHDAY';

export interface PlatformEvent {
  id: string; // Used as eventId for idempotency
  eventType: EventType;
  actorId?: string; // User who triggered it
  studentId?: string;
  courseId?: string;
  sessionId?: string;
  entityId?: string; // ID of the exam, message, etc.
  payload: Record<string, any>;
  createdAt: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
}

export interface AutomationRule {
  id: string;
  name: string;
  isActive: boolean;
  triggerEvent: EventType;
  conditions: {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
  }[];
  actions: {
    type: 'SEND_NOTIFICATION' | 'CREATE_ALERT' | 'UPDATE_STATUS';
    targetRole?: Role;
    templateId?: string;
    message?: string;
  }[];
}

export type MarketingMediaType = 'YOUTUBE_VIDEO' | 'FACEBOOK_POST' | 'INSTAGRAM_POST' | 'TIKTOK_VIDEO' | 'SOCIAL_LINK';

export interface MarketingMediaItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: MarketingMediaType;
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  courseId?: string;
  courseCode?: string;
  courseTitleAr?: string;
  courseTitleEn?: string;
  platformName?: string;
  featured?: boolean;
  category?: 'course_promo' | 'student_project' | 'center_news' | 'event' | 'testimonial';
  tags?: string[];
  createdAt: string;
  createdBy?: string;
}

// ==========================================
// CONTENT STUDIO & MEDIA ASSET MANAGEMENT
// ==========================================
export type VideoStatus = 'PUBLISHED' | 'UNPUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface PlatformVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  storagePath: string;
  videoUrl: string;
  thumbnail?: string;
  thumbnailStoragePath?: string;
  uploadedBy: string; // authenticated admin UID
  uploaderName?: string;
  uploadedAt: string;
  updatedAt: string;
  courseId?: string;
  courseTitleAr?: string;
  lessonId?: string;
  lessonTitleAr?: string;
  status: VideoStatus;
  visibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  mimeType: string;
  extension: string;
  fileSize: number;
  durationSeconds?: number;
}

export type MediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'PROMOTION' | 'GALLERY';

export interface MediaAsset {
  id: string;
  title: string;
  description?: string;
  type: MediaAssetType;
  extension: string;
  mimeType: string;
  storagePath: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  fileSize: number; // bytes
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  category: string;
  linkedEntityType?: 'COURSE' | 'PROJECT' | 'POST' | 'ANNOUNCEMENT';
  linkedEntityId?: string;
  isPublished: boolean;
}

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface Post {
  id: string;
  title: string;
  body: string;
  coverMediaId?: string;
  coverMediaUrl?: string;
  authorId: string;
  authorName: string;
  category: string;
  status: PostStatus;
  visibility: 'PUBLIC' | 'STUDENTS_ONLY' | 'TEACHERS_ONLY';
  audience: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileTypePolicy {
  allowedImageExtensions: string[];
  allowedVideoExtensions: string[];
  allowedDocumentExtensions: string[];
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
  maxDocumentSizeMB: number;
}

// ==========================================
// PROJECTS & PRESENTATION SESSION CONTROL
// ==========================================
export type ProjectStatus = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'READY_FOR_PRESENTATION' 
  | 'PRESENTED' 
  | 'APPROVED' 
  | 'NEEDS_REVISION' 
  | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitleAr?: string;
  groupId?: string;
  studentId: string;
  studentName: string;
  teamMembers?: string[];
  instructions?: string;
  requiredMaterials?: string[];
  fileUrl?: string;
  deadline?: string;
  presentationDate?: string;
  presentationSessionId?: string;
  presentationRestriction?: 'ONLY_THIS_SESSION' | 'ANY_SESSION';
  status: ProjectStatus;
  readyForPresentationAt?: string;
  readyBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PresentationSession {
  id: string;
  sessionName: string;
  courseId: string;
  courseTitleAr?: string;
  groupId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  presentationRules?: string;
  allowedProjectIds?: string[];
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

// ==========================================
// GAME ZONE & 3D GAMIFICATION
// ==========================================
export interface GameItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  threeAssetUrl?: string;
  category: 'ROBOTICS' | 'AI' | 'PROGRAMMING' | 'ELECTRONICS' | 'PUZZLE' | '3D_WORLD';
  ageRange?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  courseId?: string;
  requiredCourseId?: string;
  requiredLessonId?: string;
  xpReward: number;
  points: number;
  unlockCondition?: string;
  status: 'ACTIVE' | 'INACTIVE';
  is3D: boolean;
}


export type PaymentMethod = 'INSTAPAY' | 'VODAFONE_CASH' | 'IN_PERSON';
export type BookingStatus = 'NEW' | 'CONTACTED' | 'PAYMENT_PENDING' | 'PAYMENT_SUBMITTED' | 'PAYMENT_VERIFICATION' | 'PAYMENT_CONFIRMED' | 'BOOKING_CONFIRMED' | 'ENROLLED' | 'CANCELLED' | 'REJECTED';

export interface CourseBooking {
  id: string;
  customerName: string;
  parentName: string;
  studentName: string;
  studentDateOfBirth: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  courseId: string;
  pathId?: string;
  priceSnapshot: number;
  discountSnapshot: number;
  finalPriceSnapshot: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  paymentProofUrl?: string;
}

export interface PaymentSettings {
  instapayNumber: string;
  vodafoneCashNumber: string;
  whatsappNumber: string;
  branchInformation: string;
  instapayEnabled: boolean;
  vodafoneCashEnabled: boolean;
  inPersonEnabled: boolean;
  paymentInstructions?: string;
  paymentNotes?: string;
}
