import { 
  Course, LearningPath, RecommendationResult, RecommendedCourseSequenceItem, 
  RecommendationScoringWeights 
} from '../types';
import { 
  DEFAULT_RECOMMENDATION_WEIGHTS, DIGITAL_EMPLOYEE_COURSE 
} from './learningPathService';

export interface RecommendationEngineParams {
  age: number;
  interests: string[];
  goals: string[];
  courses: Course[];
  learningPaths: LearningPath[];
  enrolledCourseIds?: string[];
  completedCourseIds?: string[];
  classAvailabilityMap?: Record<string, number>; // courseId -> available seats count
  customWeights?: Partial<RecommendationScoringWeights>;
}

/**
 * MASTER RECOMMENDATION ENGINE
 * Dynamic multi-factor scoring algorithm powered by real Firebase courses and path rules.
 * Enforces the "Digital Employee" foundation rule and constructs categorized sequences.
 */
export const generateRecommendations = (params: RecommendationEngineParams): RecommendationResult => {
  const {
    age,
    interests = [],
    goals = [],
    courses: inputCourses = [],
    learningPaths = [],
    enrolledCourseIds = [],
    completedCourseIds = [],
    classAvailabilityMap = {},
    customWeights = {}
  } = params;

  // Merge custom weights with defaults
  const weights: RecommendationScoringWeights = {
    ...DEFAULT_RECOMMENDATION_WEIGHTS,
    ...customWeights
  };

  // Ensure DIGITAL EMPLOYEE is included in courses if not present
  const courses = [...inputCourses];
  const hasDigitalEmployee = courses.some(c => c.id === DIGITAL_EMPLOYEE_COURSE.id);
  if (!hasDigitalEmployee) {
    courses.unshift(DIGITAL_EMPLOYEE_COURSE);
  }

  const scoreMap: Record<string, number> = {};
  const whyThisCourseMap: Record<string, { ar: string; en: string }> = {};

  // Normalize text helper
  const normalize = (str?: string) => (str || '').toLowerCase();

  // Check if student completed Digital Employee Foundation
  const hasCompletedFoundation = completedCourseIds.includes('digital-employee') || completedCourseIds.includes('digital-employee-101');

  // 1. SCORE EACH COURSE
  courses.forEach((course) => {
    let score = 0;
    let primaryReasonAr = '';
    let primaryReasonEn = '';

    const isDigitalEmployee = course.id === 'digital-employee' || course.id === 'digital-employee-101' || course.tags?.includes('digital-employee');

    // A. Foundation Progression Score (+30 default if not completed yet)
    if (isDigitalEmployee && !hasCompletedFoundation) {
      score += weights.foundationProgressionWeight;
      primaryReasonAr = 'الكورس التأسيسي الزامي الم الموحد لكافة مسارات SmartTech لتنمية مهارات الموظف الرقمي.';
      primaryReasonEn = 'Mandatory universal foundation course for all SmartTech learning paths.';
    }

    // B. Age Suitability Score
    const ageMin = course.ageMin || 5;
    const ageMax = course.ageMax || 18;

    if (age >= ageMin && age <= ageMax) {
      score += weights.ageMatchWeight;
      if (!primaryReasonAr) {
        primaryReasonAr = `يناسب مرحلتك العمرية (${age} سنة) بدقة عالية.`;
        primaryReasonEn = `Perfect match for age group (${age} years).`;
      }
    } else if (Math.abs(age - ageMin) <= 2 || Math.abs(age - ageMax) <= 2) {
      score += Math.round(weights.ageMatchWeight / 2);
    } else {
      score += 2; // Baseline minimum
    }

    // C. Interests Overlap Score
    const courseText = [
      course.titleEn,
      course.titleAr,
      course.category,
      course.descriptionEn,
      course.descriptionAr,
      ...(course.skills || []),
      ...(course.interests || []),
      ...(course.tags || [])
    ].map(normalize).join(' ');

    let interestMatchesCount = 0;
    interests.forEach((interest) => {
      const lowerInterest = normalize(interest);
      if (
        (lowerInterest.includes('program') || lowerInterest.includes('برمج')) &&
        (courseText.includes('code') || courseText.includes('programm') || courseText.includes('برمج') || courseText.includes('scratch') || courseText.includes('python'))
      ) {
        score += weights.interestMatchWeight;
        interestMatchesCount++;
      } else if (
        (lowerInterest.includes('ai') || lowerInterest.includes('artificial') || lowerInterest.includes('ذكاء')) &&
        (courseText.includes('ai') || courseText.includes('intelligence') || courseText.includes('ذكاء') || courseText.includes('prompt'))
      ) {
        score += weights.interestMatchWeight;
        interestMatchesCount++;
      } else if (
        (lowerInterest.includes('robot') || lowerInterest.includes('روبوت')) &&
        (courseText.includes('robot') || courseText.includes('روبوت') || courseText.includes('lego') || courseText.includes('arduino'))
      ) {
        score += weights.interestMatchWeight;
        interestMatchesCount++;
      } else if (
        (lowerInterest.includes('game') || lowerInterest.includes('لعب') || lowerInterest.includes('العاب')) &&
        (courseText.includes('game') || courseText.includes('لعبة') || courseText.includes('2d') || courseText.includes('3d') || courseText.includes('scratch'))
      ) {
        score += weights.interestMatchWeight;
        interestMatchesCount++;
      } else if (courseText.includes(lowerInterest)) {
        score += Math.round(weights.interestMatchWeight * 0.8);
        interestMatchesCount++;
      }
    });

    if (interestMatchesCount > 0 && !primaryReasonAr) {
      primaryReasonAr = `يتوافق مع اهتماماتك المحددة في (${interests.slice(0, 2).join('، ')}).`;
      primaryReasonEn = `Matches selected interest areas (${interests.slice(0, 2).join(', ')}).`;
    }

    // D. Goals Overlap Score
    const outcomesText = [
      ...(course.learningOutcomesAr || []),
      ...(course.learningOutcomesEn || []),
      course.descriptionAr,
      course.descriptionEn
    ].map(normalize).join(' ');

    goals.forEach((goal) => {
      const lowerGoal = normalize(goal);
      if (
        (lowerGoal.includes('project') || lowerGoal.includes('مشروع')) &&
        (outcomesText.includes('project') || outcomesText.includes('مشروع') || outcomesText.includes('بناء'))
      ) {
        score += weights.goalMatchWeight;
      } else if (
        (lowerGoal.includes('basic') || lowerGoal.includes('أساس')) &&
        (course.levelAr?.includes('مبتدئ') || course.levelAr?.includes('تأسيس') || course.code?.includes('101'))
      ) {
        score += weights.goalMatchWeight;
      } else if (outcomesText.includes(lowerGoal)) {
        score += Math.round(weights.goalMatchWeight * 0.7);
      }
    });

    // E. Prerequisites Check & Score
    if (course.prerequisites && course.prerequisites.length > 0) {
      const prerequisitesMet = course.prerequisites.every(prereqId => completedCourseIds.includes(prereqId));
      if (prerequisitesMet) {
        score += weights.prerequisiteMatchWeight;
      } else {
        score -= 20; // Penalty if prerequisites not completed yet
      }
    }

    // F. Seat Availability Boost
    const availableSeats = classAvailabilityMap[course.id] ?? 8;
    if (availableSeats > 0) {
      score += weights.classAvailabilityWeight;
    } else {
      score += weights.fullClassPenalty;
    }

    // G. Enrollment / Completion Status Adjustment
    const isEnrolled = enrolledCourseIds.includes(course.id);
    const isCompleted = completedCourseIds.includes(course.id);

    if (isCompleted) {
      score += weights.completedCoursePenalty;
      primaryReasonAr = 'تم إكمال هذا الكورس بنجاح سابقاً.';
      primaryReasonEn = 'Course completed previously.';
    } else if (isEnrolled) {
      score += weights.enrolledCoursePenalty;
      primaryReasonAr = 'أنت مسجل حالياً في هذا الكورس - متابعة الدراسة.';
      primaryReasonEn = 'Currently enrolled in this course.';
    }

    // Save final score and reason tag
    scoreMap[course.id] = score;
    whyThisCourseMap[course.id] = {
      ar: primaryReasonAr || `موصى به لتعزيز المهارات التكنولوجية بعمر ${age} سنة.`,
      en: primaryReasonEn || `Recommended for age ${age} to enhance practical digital skills.`
    };
  });

  // 2. SORT COURSES BY SCORE
  const sortedCourses = [...courses].sort((a, b) => (scoreMap[b.id] || 0) - (scoreMap[a.id] || 0));

  // If student hasn't completed Digital Employee Foundation, force Digital Employee to be top #1 course
  if (!hasCompletedFoundation) {
    const digitalEmpIdx = sortedCourses.findIndex(c => c.id === 'digital-employee' || c.id === 'digital-employee-101');
    if (digitalEmpIdx > 0) {
      const [digitalEmpCourse] = sortedCourses.splice(digitalEmpIdx, 1);
      sortedCourses.unshift(digitalEmpCourse);
    }
  }

  // 3. SCORE & SELECT LEARNING PATHS
  const sortedPaths = [...learningPaths].sort((pathA, pathB) => {
    let scoreA = 0;
    let scoreB = 0;

    const textA = normalize((pathA.titleAr || '') + ' ' + (pathA.titleEn || '') + ' ' + (pathA.descriptionAr || '') + ' ' + (pathA.interests?.join(' ') || ''));
    const textB = normalize((pathB.titleAr || '') + ' ' + (pathB.titleEn || '') + ' ' + (pathB.descriptionAr || '') + ' ' + (pathB.interests?.join(' ') || ''));

    interests.forEach((interest) => {
      const lowerInterest = normalize(interest);
      if (textA.includes(lowerInterest)) scoreA += weights.interestMatchWeight;
      if (textB.includes(lowerInterest)) scoreB += weights.interestMatchWeight;
    });

    // Match path target age
    if (pathA.targetAgeMin && age >= pathA.targetAgeMin && pathA.targetAgeMax && age <= pathA.targetAgeMax) scoreA += 15;
    if (pathB.targetAgeMin && age >= pathB.targetAgeMin && pathB.targetAgeMax && age <= pathB.targetAgeMax) scoreB += 15;

    return scoreB - scoreA;
  });

  const recommendedPaths = sortedPaths.slice(0, 3);

  // 4. CATEGORIZE RECOMMENDATION BUCKETS
  const topCourses = sortedCourses.filter(c => !completedCourseIds.includes(c.id)).slice(0, 6);

  // A. Best Match
  const bestMatchCourse = topCourses[0] || DIGITAL_EMPLOYEE_COURSE;
  const bestMatchSequenceItem: RecommendedCourseSequenceItem = {
    course: bestMatchCourse,
    stepNumber: 1,
    reasonAr: whyThisCourseMap[bestMatchCourse.id]?.ar || `نقطة البداية المثالية الموصى بها لعمر ${age} سنة.`,
    reasonEn: whyThisCourseMap[bestMatchCourse.id]?.en || `Ideal starting recommendation for age ${age}.`,
    isStartHere: true,
    availableClassesCount: classAvailabilityMap[bestMatchCourse.id] ?? 8,
    nextCourseId: topCourses[1]?.id
  };

  // B. Highly Recommended Sequence
  const courseSequence: RecommendedCourseSequenceItem[] = topCourses.map((course, idx) => {
    const isStart = idx === 0;
    const availableSeats = classAvailabilityMap[course.id] ?? 8;
    return {
      course,
      stepNumber: idx + 1,
      reasonAr: whyThisCourseMap[course.id]?.ar || `الخطوة ${idx + 1} في تسلسل التعلم الموصى به.`,
      reasonEn: whyThisCourseMap[course.id]?.en || `Step ${idx + 1} in recommended sequence.`,
      isStartHere: isStart,
      availableClassesCount: availableSeats > 0 ? availableSeats : 0,
      nextCourseId: topCourses[idx + 1]?.id
    };
  });

  const highlyRecommended = topCourses.slice(1, 4);
  const optionalElectives = topCourses.slice(4);

  return {
    recommendedInterests: interests,
    recommendedPaths,
    recommendedCourses: topCourses,
    courseSequence,
    matchingScoreMap: scoreMap,
    selectedAge: age,
    selectedInterests: interests,
    selectedGoals: goals,
    bestMatch: bestMatchSequenceItem,
    highlyRecommended,
    alternativePaths: sortedPaths.slice(1, 4),
    optionalElectives,
    foundationIncluded: !hasCompletedFoundation,
    whyThisCourseMap
  };
};
