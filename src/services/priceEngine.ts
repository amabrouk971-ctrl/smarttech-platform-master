import { Course, Offer, CoursePricingResult } from '../types';

/**
 * Centralized Price Engine
 * Used across Course Page, Booking, Checkout, Admin, Revenue, Reports, Invoices, Enrollment.
 */
export function calculateCoursePrice(
  course: Course,
  activeOffers: Offer[],
  customNowMs: number = Date.now()
): CoursePricingResult {
  const basePrice = course.originalPrice || 0;
  
  if (!activeOffers || activeOffers.length === 0 || basePrice <= 0) {
    return {
      basePrice,
      finalPrice: course.discountPrice && course.discountPrice < basePrice ? course.discountPrice : basePrice,
      discountAmount: course.discountPrice && course.discountPrice < basePrice ? basePrice - course.discountPrice : 0,
      allEligibleOffers: [],
      discountPercentage: course.discountPrice && course.discountPrice < basePrice ? Math.round(((basePrice - course.discountPrice) / basePrice) * 100) : 0,
      hasOffer: false
    };
  }

  // Filter valid active offers for this course
  const eligibleOffers = activeOffers.filter(offer => {
    if (offer.status !== 'ACTIVE') return false;
    
    // Check start and end times
    const startMs = new Date(offer.startAt).getTime();
    const endMs = new Date(offer.endAt).getTime();
    if (customNowMs < startMs || customNowMs > endMs) return false;

    // Check usage limits if set
    if (offer.maxUses && offer.maxUses > 0 && offer.usageCount >= offer.maxUses) return false;

    // Check target eligibility
    if (offer.targetType === 'ALL') return true;
    if (offer.targetType === 'COURSE' && offer.targetIds.includes(course.id)) return true;
    if (offer.targetType === 'PATH' && offer.targetIds.some(id => (course as any).learningPathIds?.includes(id))) return true;
    if (offer.targetType === 'CLASS' && offer.targetIds.some(id => (course as any).classIds?.includes(id))) return true;
    
    return false;
  });

  if (eligibleOffers.length === 0) {
    const fallbackDiscount = course.discountPrice && course.discountPrice < basePrice ? course.discountPrice : basePrice;
    return {
      basePrice,
      finalPrice: fallbackDiscount,
      discountAmount: basePrice - fallbackDiscount,
      allEligibleOffers: [],
      discountPercentage: Math.round(((basePrice - fallbackDiscount) / basePrice) * 100),
      hasOffer: false
    };
  }

  // Sort offers by priority or highest discount
  eligibleOffers.sort((a, b) => {
    // First compare priority number
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // higher priority first
    }
    // Compare calculated discount
    const discA = calculateSingleDiscount(basePrice, a);
    const discB = calculateSingleDiscount(basePrice, b);
    return discB - discA;
  });

  const primaryOffer = eligibleOffers[0];
  let totalDiscount = calculateSingleDiscount(basePrice, primaryOffer);

  // Handle discount stacking if enabled on primary offer
  if (primaryOffer.allowStacking && eligibleOffers.length > 1) {
    for (let i = 1; i < eligibleOffers.length; i++) {
      const additionalOffer = eligibleOffers[i];
      if (additionalOffer.allowStacking) {
        const remainingPrice = Math.max(0, basePrice - totalDiscount);
        const stackDiscount = calculateSingleDiscount(remainingPrice, additionalOffer);
        totalDiscount += stackDiscount;
      }
    }
  }

  totalDiscount = Math.min(basePrice, Math.max(0, totalDiscount));
  const finalPrice = Math.max(0, basePrice - totalDiscount);
  const discountPercentage = basePrice > 0 ? Math.round((totalDiscount / basePrice) * 100) : 0;
  const timeRemainingMs = new Date(primaryOffer.endAt).getTime() - customNowMs;

  return {
    basePrice,
    finalPrice,
    discountAmount: totalDiscount,
    appliedOffer: primaryOffer,
    allEligibleOffers: eligibleOffers,
    discountPercentage,
    hasOffer: true,
    timeRemainingMs: Math.max(0, timeRemainingMs)
  };
}

function calculateSingleDiscount(price: number, offer: Offer): number {
  if (offer.discountType === 'PERCENTAGE') {
    return (price * offer.discountValue) / 100;
  } else {
    return Math.min(price, offer.discountValue);
  }
}
