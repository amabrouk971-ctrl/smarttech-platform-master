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
  classId?: string;
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
  studentName?: string;
  sessionId?: string;
  courseId: string;
  courseName?: string;
  classId?: string;
  className?: string;
  groupId?: string;
  teacherId?: string;
  scannerUserId?: string;
  scannerUserName?: string;
  checkInTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  method: 'QR' | 'MANUAL';
  device?: string;
  timestamp?: string;
  recordedBy?: string;
  createdAt?: string;
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
  status?: 'ACTIVE' | 'EMAIL_VERIFICATION_PENDING' | 'DISABLED' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'REJECTED';
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
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

export type PathCourseRole = 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL' | 'ADVANCED' | 'ELECTIVE';

export interface PathCourseSequenceItem {
  courseId: string;
  stepNumber: number;
  role: PathCourseRole;
  reasonAr?: string;
  reasonEn?: string;
  prerequisiteCourseIds?: string[];
}

export interface LearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  slug?: string;
  ageRange: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  iconName: string;
  image?: string;
  category?: string;
  interests?: string[];
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  personalityType?: 'assembly_engineering' | 'gaming_programming' | 'ai_shared' | 'creative_design' | 'math_iq';
  personalityLabelAr?: string;
  stages: LearningPathStage[];
  courseSequence?: PathCourseSequenceItem[];
  foundationRequired?: boolean; // Default true (DIGITAL EMPLOYEE)
  foundationCourseId?: string; // Default 'digital-employee'
  requiredCourseIds?: string[];
  recommendedCourseIds?: string[];
  optionalCourseIds?: string[];
  advancedCourseIds?: string[];
  prerequisites?: string[];
  nextPaths?: string[];
  targetAudienceAr: string;
  targetAudienceEn: string;
  estimatedWeeks: number;
  badgeReward: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  version?: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecializationInterest {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  iconName: string;
  color: string;
  categoryTag: string;
  priority: number;
  enabled: boolean;
  assignedCourseIds: string[];
  assignedPathIds: string[];
}

export interface RecommendationScoringWeights {
  interestMatchWeight: number; // default 30
  goalMatchWeight: number; // default 25
  ageMatchWeight: number; // default 15
  prerequisiteMatchWeight: number; // default 20
  pathMatchWeight: number; // default 20
  foundationProgressionWeight: number; // default 30
  classAvailabilityWeight: number; // default 10
  completedCoursePenalty: number; // default -100
  enrolledCoursePenalty: number; // default -80
  fullClassPenalty: number; // default -50
}

export interface RecommendationRulesConfig {
  id: string;
  weights: RecommendationScoringWeights;
  updatedAt: string;
  updatedBy?: string;
}

export interface PathValidationResult {
  valid: boolean;
  hasFoundation: boolean;
  hasCircularDependency: boolean;
  circularDependencyPath?: string[];
  errors: string[];
  warnings: string[];
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
// OFFERS & PRICING ENGINE
// ==========================================

export type OfferDiscountType = 'PERCENTAGE' | 'FIXED';
export type OfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SCHEDULED';
export type OfferTargetType = 'COURSE' | 'PATH' | 'CLASS' | 'STUDENT' | 'GROUP' | 'ALL';
export type OfferPriorityStrategy = 'HIGHEST_DISCOUNT' | 'LOWEST_DISCOUNT' | 'PRIORITY_NUMBER' | 'FIRST_MATCHING';

export interface Offer {
  id: string;
  name: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  originalPrice?: number;
  discountedPrice?: number;
  startAt: string;
  endAt: string;
  duration: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'CUSTOM' | string;
  status: OfferStatus;
  targetType: OfferTargetType;
  targetIds: string[];
  maxUses?: number;
  usageCount: number;
  maxUsesPerCustomer?: number;
  promoCode?: string;
  bannerUrl?: string;
  terms?: string;
  priority: number;
  allowStacking: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoursePricingResult {
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedOffer?: Offer;
  allEligibleOffers: Offer[];
  discountPercentage: number;
  hasOffer: boolean;
  timeRemainingMs?: number;
}

// ==========================================
// EMAIL CAMPAIGNS & AUTOMATION
// ==========================================

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
export type RecipientType = 
  | 'ALL_STAFF' 
  | 'SELECTED_STAFF' 
  | 'ALL_EMPLOYEES' 
  | 'SELECTED_EMPLOYEES' 
  | 'ALL_TEACHERS' 
  | 'SELECTED_TEACHERS' 
  | 'ALL_STUDENTS' 
  | 'SELECTED_STUDENTS' 
  | 'ALL_PARENTS' 
  | 'SELECTED_PARENTS' 
  | 'COURSE_STUDENTS' 
  | 'LEARNING_PATH' 
  | 'CLASS' 
  | 'GROUP' 
  | 'CUSTOM_LIST';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipientType: RecipientType;
  targetIds?: string[];
  customEmails?: string[];
  templateHtml: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  successCount?: number;
  failureCount?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  campaignId?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  errorDetails?: string;
  sentAt: string;
}

// ==========================================
// SUPPORT CENTER & BUG REPORTING
// ==========================================

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'WAITING_FOR_ADMIN' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketCategory = 'TECHNICAL' | 'COURSE' | 'PAYMENT' | 'ACCOUNT' | 'ATTENDANCE' | 'QR_CODE' | 'VIDEO' | 'EXAM' | 'INTERACTIVE_LAB' | 'PROJECT' | 'PARENT_SUPPORT' | 'TEACHER_SUPPORT' | 'OTHER';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userDob?: string;
  userRole: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  courseId?: string;
  courseName?: string;
  assignedToId?: string;
  assignedToName?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    deviceType?: string;
    screenSize?: string;
    currentRoute?: string;
  };
  hasUnreadAdmin?: boolean;
  hasUnreadCustomer?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaStatus?: 'WITHIN_SLA' | 'AT_RISK' | 'OVERDUE';
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text?: string;
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  imageUrl?: string;
  attachmentsUrl?: string[];
  isInternalNote?: boolean;
  createdAt: string;
}

export interface SupportQuickReply {
  id: string;
  title: string;
  category: string;
  messageAr: string;
  messageEn?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export type BugStatus = 'NEW' | 'INVESTIGATING' | 'CONFIRMED' | 'IN_DEVELOPMENT' | 'FIXED' | 'CLOSED' | 'DUPLICATE' | 'CANNOT_REPRODUCE';

export interface BugReport {
  id: string;
  bugNumber: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  screenshotUrl?: string;
  recordingUrl?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  currentRoute?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  screenSize?: string;
  status: BugStatus;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}




export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PENDING_PAYMENT' | 'PENDING_VERIFICATION' | 'PAY_IN_CENTER_PENDING' | 'SUBMITTED' | 'VERIFIED' | 'PAID' | 'FAILED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

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
  interestLevel?: string;
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
  certificateNumber: string;
  serialNumber: string;
  verificationId: string;
  studentId?: string;
  studentName: string;
  studentNameAr?: string;
  studentNameEn?: string;
  studentEmail?: string;
  studentProfileId?: string;
  certificateName: string;
  courseId?: string;
  courseCode?: string;
  courseName: string;
  courseTitleAr?: string;
  courseTitleEn?: string;
  learningPathId?: string;
  learningPathName?: string;
  classId?: string;
  instructorId?: string;
  instructorName?: string;
  instructorNameAr?: string;
  issueDate: string;
  completionDate?: string;
  startDate?: string;
  endDate?: string;
  result: 'Passed' | 'Failed' | 'Incomplete' | 'Withdrawn' | string;
  score?: number | string;
  attendancePercentage?: number;
  status: 'DRAFT' | 'ISSUED' | 'VALID' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'REPLACED' | 'PENDING_VERIFICATION';
  certificateFilePath?: string;
  certificateImagePath?: string;
  qrCode?: string;
  verificationUrl?: string;
  templateId?: string;
  batchId?: string;
  replaces?: string;
  replacedBy?: string;
  revocationReason?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  // Legacy aliases
  certificateCode?: string;
  qrUrl?: string;
  pathTitleAr?: string;
}

export interface CertificateAuditLog {
  id: string;
  certificateId?: string;
  certificateNumber?: string;
  action: 'CREATED' | 'ISSUED' | 'UPDATED' | 'VIEWED' | 'VERIFIED' | 'DOWNLOADED' | 'REVOKED' | 'RESTORED' | 'REPLACED' | 'IMPORTED' | 'EXPORTED';
  performedBy?: string;
  timestamp: string;
  details?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  templateUrl?: string;
  isDefault?: boolean;
  courseId?: string;
  learningPathId?: string;
  qrPlacement?: { x: number; y: number; width: number; height: number };
  createdAt: string;
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

export type ProductType = 'REGULAR_PRODUCT' | 'SPARE_PART' | 'SMART_ACCESSORY' | 'EDUCATIONAL_COMPONENT' | 'OTHER' | string;

export interface ProductCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  productType: ProductType;
  subcategories: string[];
  description?: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  supplierId: string;
  companyName: string;
  contactName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  taxInfo?: string;
  paymentTerms?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  productsSupplied?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SupplierPriceRecord {
  supplierId: string;
  supplierName: string;
  price: number;
  date: string;
  poNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  sku: string;
  barcode?: string;
  productType: ProductType;
  category: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  description: string;
  shortDescription?: string;
  originalPrice?: number;
  sellingPrice: number;
  price?: number; // legacy alias
  discountPrice?: number;
  costPrice: number;
  profitMargin?: number;
  stockQuantity: number;
  minimumStock: number;
  reservedStock?: number;
  availableStock?: number;
  unit?: string;
  supplier?: string;
  supplierId?: string;
  storageLocation?: string;
  warranty?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  mainImagePath: string;
  image?: string; // legacy alias
  images?: string[];
  specifications?: Record<string, string> | string;
  priceHistory?: SupplierPriceRecord[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  // Legacy fields compatibility
  titleAr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  categoryAr?: string;
  inStock?: boolean;
}

export type StoreItem = Product;

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'DAMAGED' | 'RETURNED' | 'SOLD' | 'RESERVED' | 'PURCHASE_RECEIVE' | 'RETURN_TO_SUPPLIER';
  quantity: number;
  previousStock: number;
  newStock: number;
  poNumber?: string;
  supplierId?: string;
  supplierName?: string;
  employeeId?: string;
  employeeName?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface RequestComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
}

export interface PurchaseRequestItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedSubtotal: number;
}

export interface PurchaseRequest {
  id: string;
  requestId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseRequestItem[];
  totalEstimatedCost: number;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requiredDate: string;
  notes?: string;
  attachments?: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED_TO_PO';
  adminFeedback?: string;
  convertedPoId?: string;
  comments?: RequestComment[];
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
}

export interface POAuditLog {
  id: string;
  action: 'CREATED' | 'EDITED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SENT_TO_SUPPLIER' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';
  performedBy: string;
  performedByName: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId?: string;
  supplierId: string;
  supplierName: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  otherCosts: number;
  totalCost: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  deliveryStatus: 'PENDING' | 'PARTIALLY_DELIVERED' | 'DELIVERED';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_SUPPLIER' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';
  notes?: string;
  attachments?: string[];
  auditTrail?: POAuditLog[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReceivingItem {
  productId: string;
  productName: string;
  sku?: string;
  orderedQuantity: number;
  previouslyReceivedQuantity: number;
  currentlyReceivedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  rejectedQuantity: number;
  serialNumbers?: string[];
  batchNumber?: string;
  expirationDate?: string;
}

export interface ReceivingRecord {
  id: string;
  receivingNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedBy: string;
  receivedByName: string;
  receivedDate: string;
  items: ReceivingItem[];
  totalItemsReceived: number;
  invoiceNumber?: string;
  deliveryNoteNumber?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
}

export interface PurchaseReturnItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  poId?: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  returnDate: string;
  items: PurchaseReturnItem[];
  totalReturnAmount: number;
  reason: string;
  condition: string;
  attachments?: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CLOSED';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  recordedBy: string;
  recordedByName?: string;
  notes?: string;
  attachment?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  previousStock: number;
  newStock: number;
  adjustmentQty: number;
  type: 'ADD' | 'REMOVE' | 'SET';
  reason: string;
  performedBy: string;
  performedByName?: string;
  createdAt: string;
}

export interface CertificateImportBatch {
  id: string;
  batchId: string;
  fileName: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  duplicateRows: number;
  warningRows: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  logReportUrl?: string;
}

export interface CertificateImportRow {
  rowNumber: number;
  rawData: Record<string, string>;
  parsedCertificate?: Partial<Certificate>;
  validationStatus: 'VALID' | 'WARNING' | 'ERROR' | 'DUPLICATE';
  validationErrors: string[];
  duplicateDetails?: string;
}

export interface StoreOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  mainImagePath?: string;
}

export interface StoreOrder {
  id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  items: StoreOrderItem[];
  totalAmount: number;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  whatsAppMessage: string;
  createdAt: string;
  updatedAt?: string;
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

export interface CourseReview {
  id: string;
  courseId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  reviewText: string;
  courseTitleAr?: string;
  date?: string;
  verifiedStudent?: boolean;
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


export interface DiscoveryProfile {
  targetAudience: 'MY_CHILD' | 'MYSELF' | 'ANOTHER_STUDENT';
  childName?: string;
  childAge: number;
  interests: string[];
  goals: string[];
  updatedAt?: string;
}

export interface ChildProfileData {
  id: string;
  name: string;
  age: number;
  interests: string[];
  goals: string[];
  avatarUrl?: string;
  enrolledCourseIds?: string[];
  completedCourseIds?: string[];
  discoveryProfile?: DiscoveryProfile;
  createdAt?: string;
}

export interface DiscoveryQuestionOption {
  id: string;
  textAr: string;
  textEn: string;
  iconName?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  value: string;
  categoryTag?: string;
}

export interface DiscoveryQuestion {
  id: string;
  step: number;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  type: 'SINGLE' | 'MULTIPLE' | 'AGE_SLIDER';
  options: DiscoveryQuestionOption[];
  enabled: boolean;
}

export interface DiscoveryConfig {
  questions: DiscoveryQuestion[];
  recommendationRules: {
    ageWeight: number;
    interestWeight: number;
    goalWeight: number;
    availabilityBoost: number;
  };
  enabled: boolean;
  updatedAt?: string;
}

export interface RecommendedCourseSequenceItem {
  course: Course;
  stepNumber: number;
  reasonAr: string;
  reasonEn: string;
  isStartHere?: boolean;
  availableClassesCount: number;
  nextCourseId?: string;
}

export interface RecommendationResult {
  recommendedInterests: string[];
  recommendedPaths: LearningPath[];
  recommendedCourses: Course[];
  courseSequence: RecommendedCourseSequenceItem[];
  matchingScoreMap: Record<string, number>;
  selectedAge: number;
  selectedInterests: string[];
  selectedGoals: string[];
  bestMatch?: RecommendedCourseSequenceItem;
  highlyRecommended?: Course[];
  alternativePaths?: LearningPath[];
  optionalElectives?: Course[];
  foundationIncluded?: boolean;
  whyThisCourseMap?: Record<string, { ar: string; en: string }>;
}

export type PaymentMethod = 'INSTAPAY' | 'VODAFONE_CASH' | 'IN_PERSON';
export type BookingStatus = 'NEW' | 'CONTACTED' | 'PAYMENT_PENDING' | 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'PAYMENT_SUBMITTED' | 'PAYMENT_VERIFICATION' | 'PAYMENT_CONFIRMED' | 'BOOKING_CONFIRMED' | 'CONFIRMED' | 'ENROLLED' | 'WAITLIST' | 'CANCELLED' | 'REJECTED' | 'COMPLETED';

export interface CourseBooking {
  id: string;
  bookingId?: string;
  customerId?: string;
  customerName: string;
  parentName: string;
  studentName: string;
  studentDateOfBirth?: string;
  phone: string;
  whatsappNumber: string;
  email?: string;
  studentId?: string;
  parentId?: string;
  isParent?: boolean;
  childName?: string;
  childAge?: number | string;
  childId?: string;
  courseId: string;
  courseName?: string;
  pathId?: string;
  classId?: string;
  className?: string;
  classNameSnapshot?: string;
  courseNameSnapshot?: string;
  startDate?: string;
  schedule?: string;
  attendanceMode?: 'IN_PERSON' | 'ONLINE' | string;
  priceSnapshot: number;
  discountSnapshot: number;
  finalPriceSnapshot: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  whatsappStatus?: 'SENT' | 'NOT_SENT' | 'PENDING';
  assignedEmployee?: string;
  assignedEmployeeId?: string;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  paymentProofUrl?: string;
  reservationType?: 'GROUP' | 'PRIVATE' | 'LECTURES' | string;
  expectedDuration?: string;
}

export interface WhatsAppTemplates {
  courseInquiry: string;
  instapayPayment: string;
  vodafoneCashPayment: string;
  payInCenter: string;
  bookingConfirmation: string;
}

export interface ContactPaymentSettings {
  instapayNumber: string;
  instapayWhatsapp: string;
  vodafoneCashNumber: string;
  vodafoneCashWhatsapp: string;
  supportWhatsapp: string;
  centerName: string;
  centerAddress: string;
  googleMapsUrl: string;
  latitude?: number | null;
  longitude?: number | null;
  businessHours: string;
  paymentRecipientName: string;
  paymentInstructions: string;
  paymentConfirmationInstructions: string;
  enableInstapay: boolean;
  enableVodafoneCash: boolean;
  enablePayInCenter: boolean;
  // Aliases for backwards compatibility
  instapayEnabled?: boolean;
  vodafoneCashEnabled?: boolean;
  inPersonEnabled?: boolean;
  whatsappNumber?: string;
  branchInformation?: string;
  paymentInstructionsText?: string;
  paymentNotes?: string;
  whatsappTemplates?: WhatsAppTemplates;
  updatedAt?: string;
}

export type PaymentSettings = ContactPaymentSettings;

export interface CourseUnit {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn?: string;
  order: number;
  isVisible: boolean;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  unitId: string;
  titleAr: string;
  titleEn?: string;
  type: 'LESSON' | 'ACTIVITY' | 'PROJECT' | 'ASSESSMENT';
  order: number;
  durationMinutes?: number;
  content?: string;
}

export type CourseAccessStatus = 
  | 'NOT_STARTED' 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'EXPIRED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'SUSPENDED';

export type MaterialType = 
  | 'VIDEO' 
  | 'PRESENTATION' 
  | 'PDF' 
  | 'DOCUMENT' 
  | 'IMAGE' 
  | 'AUDIO' 
  | 'LINK' 
  | 'QUIZ' 
  | 'EXAM' 
  | 'ASSIGNMENT' 
  | 'PROJECT' 
  | 'SIMULATION' 
  | 'INTERACTIVE_LAB' 
  | 'WORKSHEET' 
  | 'RESOURCE' 
  | 'OTHER';

export type MaterialStatus = 'DRAFT' | 'SCHEDULED' | 'AVAILABLE' | 'LOCKED' | 'ARCHIVED';

export type MaterialAvailabilityRule = 
  | 'IMMEDIATE' 
  | 'ON_ENROLLMENT' 
  | 'SPECIFIC_DATE' 
  | 'AFTER_PREVIOUS_LESSON' 
  | 'AFTER_PREVIOUS_UNIT' 
  | 'AFTER_PREVIOUS_EXAM' 
  | 'PREREQUISITE' 
  | 'MANUAL';

export interface CourseMaterial {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  type?: MaterialType;
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  url?: string;
  fileUrl?: string;
  fileType?: 'PDF' | 'VIDEO' | 'DOC' | 'ZIP' | 'LINK' | string;
  target?: ContentTarget;
  storagePath?: string;
  thumbnail?: string;
  mimeType?: string;
  fileSize?: number;
  durationMinutes?: number;
  visibility?: 'PUBLIC' | 'STUDENT_ONLY' | 'ADMIN_ONLY';
  status?: MaterialStatus;
  availabilityRule?: MaterialAvailabilityRule;
  availableFrom?: string;
  availableUntil?: string;
  allowDownload?: boolean;
  studentOnly?: boolean;
  requiresEnrollment?: boolean;
  prerequisiteMaterialId?: string;
  order?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  courseNameAr?: string;
  classId?: string;
  learningPathId?: string;
  status: CourseAccessStatus;
  startDate?: string;
  endDate?: string;
  openAllMaterials: boolean;
  allowDownload?: boolean;
  progressPercentage?: number;
  lastLessonId?: string;
  lastUnitId?: string;
  lastMaterialId?: string;
  lastAccessedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentMaterialAccess {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  materialId: string;
  access: 'OPEN' | 'CLOSED' | 'LOCKED';
  override?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  allowDownload?: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgressRecord {
  id: string;
  studentId: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  materialId: string;
  materialType?: MaterialType;
  completed: boolean;
  videoLastPositionSeconds?: number;
  videoTotalSeconds?: number;
  presentationLastSlide?: number;
  presentationTotalSlides?: number;
  quizScore?: number;
  labScore?: number;
  completedAt?: string;
  updatedAt: string;
}

export interface CourseClass {
  id: string;
  courseId: string;
  name: string;
  capacity: number;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'CUSTOM';
  customStartTime?: string;
  customEndTime?: string;
  days: string[];
  deliveryMode: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  branchId?: string;
  room?: string;
  teacherId?: string;
  meetingLink?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMING_SOON' | 'OPEN_FOR_ENROLLMENT' | 'FULL' | 'WAITLIST' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  role: Role;
  eventType: string;
  sourceId?: string;
  sourceType?: string;
  xpAmount: number;
  description: string;
  idempotencyKey: string;
  createdAt: string;
  createdBy: string;
  metadata?: any;
}

export interface XPProfile {
  userId: string;
  role: Role;
  totalXP: number;
  currentLevelId: string;
  currentLevel: number;
  currentLevelTitle: string;
  xpToNextLevel?: number;
  progressPercentage?: number;
  lastActivityAt: string;
  streak: number;
  updatedAt: string;
}

export interface GamificationLevel {
  id: string;
  role: Role;
  levelNumber: number;
  title: string;
  minXP: number;
  icon?: string;
  badge?: string;
  description?: string;
  rewards?: string[];
  active: boolean;
}

export interface GamificationRule {
  id: string;
  role: Role;
  eventType: string;
  xpAmount: number;
  description: string;
  active: boolean;
  cooldownMinutes?: number;
  maxDailyAwards?: number;
}

export interface EmployeeGoal {
  id: string;
  name: string;
  description: string;
  goalType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
  targetValue: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  employeeId?: string; // Optional: specific employee
  role?: Role; // Optional: for a specific role
  active: boolean;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  employeeId: string;
  currentValue: number;
  completed: boolean;
  completedAt?: string;
  lastUpdatedAt: string;
}

// ==========================================
// ADVANCED INTERACTIVE LABS SYSTEM TYPES
// ==========================================

export type LabType =
  | 'QUIZ_LAB'
  | 'INTERACTIVE_SIMULATION'
  | 'DRAG_AND_DROP'
  | 'MATCHING'
  | 'ORDERING'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_ANSWER'
  | 'TRUE_FALSE'
  | 'FILL_IN_BLANK'
  | 'CODE_CHALLENGE'
  | 'DEBUGGING_CHALLENGE'
  | 'ELECTRONICS_SIMULATION'
  | 'ROBOTICS_SIMULATION'
  | 'AI_PROMPT_LAB'
  | 'AI_CHAT_LAB'
  | 'IMAGE_GENERATION_LAB'
  | 'BUSINESS_SIMULATION'
  | 'DECISION_MAKING'
  | 'DRAWING_DESIGN_LAB'
  | 'CANVAS_LAB'
  | 'PROJECT_BUILDER'
  | 'FILE_UPLOAD_CHALLENGE'
  | 'PRESENTATION_CHALLENGE'
  | 'RESEARCH_CHALLENGE'
  | 'OPEN_ENDED_TASK'
  | 'TEACHER_EVALUATED_TASK'
  | 'TIMED_CHALLENGE'
  | 'ESCAPE_ROOM'
  | 'GAMIFIED_MISSION'
  | 'CUSTOM_LAB';

export type LabDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type LabStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface QuestionBankItem {
  id: string;
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'MATCHING' | 'ORDERING' | 'CODE_VALIDATION' | 'CIRCUIT_VALIDATION';
  questionAr: string;
  questionEn?: string;
  options?: { id: string; textAr: string; textEn?: string; isCorrect?: boolean; pairTargetId?: string }[];
  correctAnswers?: string[]; // IDs or exact string
  explanationAr?: string;
  explanationEn?: string;
  hintAr?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  points: number;
  difficulty: LabDifficulty;
  tags: string[];
  learningObjective?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionPool {
  id: string;
  titleAr: string;
  titleEn?: string;
  courseId?: string;
  tags: string[];
  questionIds: string[];
  selectCount: number; // e.g. pick 10 random questions from pool
  difficultyDistribution?: { BEGINNER?: number; INTERMEDIATE?: number; ADVANCED?: number };
}

export interface LabAccessRule {
  id: string;
  labId: string;
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  learningPathIds?: string[];
  enrolledCoursesOnly?: boolean;
  minCourseProgressPercentage?: number;
  minPreviousLabScorePercentage?: number;
  prerequisiteLabIds?: string[];
  allowedRoles?: Role[];
  allowedGroupIds?: string[];
  allowedClassIds?: string[];
  allowedStudentIds?: string[];
  allowedTeacherIds?: string[];
  sessionOnly?: boolean;
  sessionId?: string;
  availableFrom?: string;
  availableUntil?: string;
  minAge?: number;
  maxAge?: number;
  minAttendancePercentage?: number;
  status: 'ACTIVE' | 'DISABLED';
}

export interface AIModelProviderConfig {
  id: string;
  providerName: string; // e.g. "Google Gemini", "OpenAI Proxy", "Custom API"
  providerType: 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL_MODEL' | 'CUSTOM_API';
  baseUrl?: string;
  apiKeyEnvVar: string; // Environment variable reference
  modelName: string; // e.g. "gemini-3.6-flash", "gpt-4o"
  apiVersion?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  timeoutMs?: number;
  rateLimitPerMinute?: number;
  rateLimitPerStudentDaily?: number;
  enabled: boolean;
  isDefault: boolean;
  fallbackModelId?: string;
  allowedCourseIds?: string[];
  allowedLabIds?: string[];
  allowedRoles?: Role[];
  usageCount: number;
  totalTokensUsed: number;
  estimatedCostUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIPromptLabConfig {
  systemPrompt?: string;
  targetRole?: string;
  targetContext?: string;
  targetTask?: string;
  allowedModels?: string[];
  evaluationRubric?: {
    criteriaAr: string;
    weight: number;
    descriptionAr: string;
  }[];
  sampleGoodPrompts?: string[];
  expectedKeywords?: string[];
}

export interface ElectronicsLabConfig {
  allowedComponents: ('LED' | 'RESISTOR' | 'BATTERY' | 'BUTTON' | 'POTENTIOMETER' | 'MOTOR' | 'SERVO' | 'BUZZER' | 'SENSOR_LIGHT' | 'SENSOR_DISTANCE' | 'ARDUINO_UNO' | 'ESP32' | 'BREADBOARD' | 'WIRES')[];
  prebuiltCircuit?: {
    components: { id: string; type: string; x: number; y: number; pins: Record<string, string>; value?: string }[];
    wires: { fromCompId: string; fromPin: string; toCompId: string; toPin: string; color?: string }[];
  };
  validationTarget: {
    requiredComponents: string[];
    requiredConnections: { fromComp: string; fromPin: string; toComp: string; toPin: string }[];
    pinConfigMatch?: { pin: number; mode: 'INPUT' | 'OUTPUT' | 'ANALOG'; expectedState?: string }[];
    expectedOutputLog?: string;
  };
}

export interface CodeLabConfig {
  allowedLanguages: ('PYTHON' | 'JAVASCRIPT' | 'HTML_CSS' | 'CPP' | 'JAVA' | 'SCRATCH')[];
  defaultLanguage: 'PYTHON' | 'JAVASCRIPT' | 'HTML_CSS' | 'CPP' | 'JAVA' | 'SCRATCH';
  initialCodeTemplate: string;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    points: number;
  }[];
  solutionCode?: string;
}

export interface BusinessLabConfig {
  scenarioTitleAr: string;
  scenarioDescriptionAr: string;
  startingCapital: number;
  monthlyExpenses: number;
  variables: {
    id: string;
    nameAr: string;
    type: 'PRICING' | 'MARKETING_BUDGET' | 'STAFF_COUNT' | 'SERVICE_QUALITY';
    defaultValue: number;
    min: number;
    max: number;
  }[];
  simulationRules: {
    metricNameAr: string;
    targetValue: number;
    formulaDescriptionAr: string;
  }[];
}

export interface DesignLabConfig {
  canvasWidth: number;
  canvasHeight: number;
  presetShapes: string[];
  requiredElementsCount?: number;
  allowImageUpload: boolean;
  requiredColors?: string[];
}

export interface InteractiveLab {
  id: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  learningPathIds?: string[];
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  instructionsAr: string;
  type: LabType;
  difficulty: LabDifficulty;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  passPercentage: number;
  xpReward: number;
  perfectScoreXpBonus?: number;
  prerequisiteLabIds?: string[];
  sessionOnly?: boolean;
  sessionId?: string;
  mediaAssets?: { type: 'IMAGE' | 'VIDEO' | 'AUDIO' | '3D_MODEL'; url: string; titleAr?: string }[];
  questionIds?: string[];
  questionPoolIds?: string[];
  randomizeQuestions?: boolean;
  aiConfig?: AIPromptLabConfig;
  electronicsConfig?: ElectronicsLabConfig;
  codeConfig?: CodeLabConfig;
  businessConfig?: BusinessLabConfig;
  designConfig?: DesignLabConfig;
  status: LabStatus;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabAttempt {
  id: string;
  labId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  attemptNumber: number;
  scorePercentage: number;
  passed: boolean;
  totalPointsEarned: number;
  maxPointsPossible: number;
  xpEarned: number;
  timeTakenSeconds: number;
  answers: Record<string, any>;
  codeSubmitted?: string;
  circuitSubmitted?: any;
  promptSubmitted?: string;
  businessDecisionsSubmitted?: any;
  drawingCanvasDataUrl?: string;
  feedbackAr?: string;
  evaluatorType: 'AUTOMATIC' | 'TEACHER' | 'AI_HYBRID';
  teacherFeedbackAr?: string;
  teacherScoreOverride?: number;
  teacherEvaluatedAt?: string;
  teacherId?: string;
  completedAt: string;
}

export interface StudentLabProgress {
  id: string;
  studentId: string;
  labId: string;
  courseId: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  bestScorePercentage: number;
  bestXpEarned: number;
  attemptsCount: number;
  unlockedAt?: string;
  passedAt?: string;
  lastAttemptAt?: string;
}

export interface LabProjectSubmission {
  id: string;
  labId: string;
  title: string;
  description: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  studentId: string;
  studentName: string;
  filesUrl?: string[];
  codeContent?: string;
  circuitJson?: any;
  drawingDataUrl?: string;
  presentationSlideUrl?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'READY_FOR_PRESENTATION' | 'PRESENTED' | 'APPROVED' | 'NEEDS_REVISION' | 'COMPLETED';
  presentationSessionId?: string;
  presentationDate?: string;
  gradeScore?: number;
  teacherFeedbackAr?: string;
  teacherId?: string;
  xpEarned?: number;
  submittedAt: string;
  evaluatedAt?: string;
}

export interface DatabaseCollectionMeta {
  name: string;
  documentCount: number;
  sizeEstimateBytes: number;
  indexesCount: number;
  descriptionAr: string;
  primaryFields: string[];
}

export interface DatabaseSchemaExport {
  version: string;
  generatedAt: string;
  databaseProvider: string;
  collections: Record<string, {
    description: string;
    fields: { name: string; type: string; required: boolean; description?: string }[];
    indexes: string[];
  }>;
}

export interface SchemaMigrationDiff {
  newCollections: string[];
  deletedCollections: string[];
  modifiedCollections: {
    collectionName: string;
    addedFields: string[];
    removedFields: string[];
    typeChanges: string[];
  }[];
  potentialBreakingChanges: string[];
}


export interface AuthSettings {
  enableEmailPassword: boolean;
  enableGoogle: boolean;
  enablePhone: boolean;
  requireEmailVerification: boolean;
  allowGuestAccess: boolean;
  allowStudentRegistration: boolean;
  allowParentRegistration: boolean;
  allowTeacherRegistration: boolean;
  requireTeacherApproval: boolean;
  requireStudentApproval: boolean;
  requireParentApproval: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  sessionTimeoutHours: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  eventType: 'SIGN_IN' | 'SIGN_OUT' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET_COMPLETED' | 'PASSWORD_CHANGED' | 'EMAIL_VERIFIED' | 'EMAIL_CHANGED' | 'ACCOUNT_CREATED' | 'ACCOUNT_DISABLED' | 'ACCOUNT_ENABLED' | 'ROLE_CHANGED' | 'PERMISSION_CHANGED' | 'ALL_SESSIONS_REVOKED';
  timestamp: string;
  actorId?: string;
  actorRole?: string;
  result: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, any>;
}
