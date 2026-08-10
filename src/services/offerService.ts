import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  increment
} from 'firebase/firestore';
import { Offer, OfferStatus } from '../types';

const OFFERS_COLLECTION = 'offers';

/**
 * Fetch all offers from Firestore with auto-expiration check
 */
export async function fetchOffers(): Promise<Offer[]> {
  try {
    const snap = await getDocs(collection(db, OFFERS_COLLECTION));
    const nowMs = Date.now();
    const offers: Offer[] = [];

    for (const d of snap.docs) {
      const data = d.data() as Offer;
      const offer: Offer = { id: d.id, ...data };
      
      // Auto-expire offer if end time passed
      const endMs = new Date(offer.endAt).getTime();
      if (offer.status === 'ACTIVE' && endMs <= nowMs) {
        offer.status = 'EXPIRED';
        updateDoc(doc(db, OFFERS_COLLECTION, offer.id), { 
          status: 'EXPIRED', 
          updatedAt: new Date().toISOString() 
        }).catch(console.error);
      }
      offers.push(offer);
    }

    return offers;
  } catch (err) {
    console.error('Error fetching offers:', err);
    return [];
  }
}

/**
 * Fetch active non-expired offers
 */
export async function fetchActiveOffers(): Promise<Offer[]> {
  try {
    const q = query(
      collection(db, OFFERS_COLLECTION),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);
    const nowMs = Date.now();
    const activeOffers: Offer[] = [];

    for (const d of snap.docs) {
      const data = d.data() as Offer;
      const offer: Offer = { id: d.id, ...data };
      const startMs = new Date(offer.startAt).getTime();
      const endMs = new Date(offer.endAt).getTime();

      if (endMs <= nowMs) {
        // Auto-expire
        updateDoc(doc(db, OFFERS_COLLECTION, offer.id), { 
          status: 'EXPIRED', 
          updatedAt: new Date().toISOString() 
        }).catch(console.error);
      } else if (nowMs >= startMs) {
        activeOffers.push(offer);
      }
    }

    return activeOffers;
  } catch (err) {
    console.error('Error fetching active offers:', err);
    return [];
  }
}

/**
 * Create or update an offer
 */
export async function saveOffer(offerData: Partial<Offer> & { name: string }): Promise<string> {
  const offerId = offerData.id || `OFFER-${Date.now()}`;
  const offerRef = doc(db, OFFERS_COLLECTION, offerId);
  const now = new Date().toISOString();

  const startMs = new Date(offerData.startAt || now).getTime();
  const endMs = new Date(offerData.endAt || now).getTime();
  const nowMs = Date.now();

  let computedStatus: OfferStatus = offerData.status || 'ACTIVE';
  if (nowMs > endMs) {
    computedStatus = 'EXPIRED';
  } else if (nowMs < startMs) {
    computedStatus = 'SCHEDULED';
  }

  const payload: Omit<Offer, 'id'> = {
    name: offerData.name,
    description: offerData.description || '',
    discountType: offerData.discountType || 'PERCENTAGE',
    discountValue: offerData.discountValue || 0,
    originalPrice: offerData.originalPrice || 0,
    discountedPrice: offerData.discountedPrice || 0,
    startAt: offerData.startAt || now,
    endAt: offerData.endAt || new Date(Date.now() + 86400000).toISOString(),
    duration: offerData.duration || 'ONE_DAY',
    status: computedStatus,
    targetType: offerData.targetType || 'ALL',
    targetIds: offerData.targetIds || [],
    maxUses: offerData.maxUses || undefined,
    usageCount: offerData.usageCount || 0,
    maxUsesPerCustomer: offerData.maxUsesPerCustomer || 1,
    promoCode: offerData.promoCode || '',
    bannerUrl: offerData.bannerUrl || '',
    terms: offerData.terms || '',
    priority: offerData.priority || 1,
    allowStacking: offerData.allowStacking || false,
    createdBy: offerData.createdBy || 'ADMIN',
    createdAt: offerData.createdAt || now,
    updatedAt: now
  };

  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(offerRef, cleanPayload, { merge: true });
  return offerId;
}

/**
 * Increment offer usage count
 */
export async function recordOfferUsage(offerId: string): Promise<void> {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    await updateDoc(offerRef, {
      usageCount: increment(1),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error recording offer usage:', err);
  }
}

/**
 * Delete an offer
 */
export async function deleteOffer(offerId: string): Promise<void> {
  await deleteDoc(doc(db, OFFERS_COLLECTION, offerId));
}
