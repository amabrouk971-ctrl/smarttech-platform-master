import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface SiteBrandingSettings {
  logoUrl: string | null; // Data URL (PNG/JPG) or external URL
  logoHeightPx: number;
  brandNameAr: string;
  brandNameEn: string;
  brandTaglineAr: string;
  primaryColorHex: string;
  accentColorHex: string;
  fontFamily: 'Cairo' | 'Tajawal' | 'Readex Pro' | 'Almarai' | 'Alexandria' | 'IBM Plex Sans Arabic' | 'Plus Jakarta Sans';
  announcementTextAr: string;
  announcementBgColorHex: string;
  headerTheme: 'dark' | 'slate' | 'navy' | 'light';
  footerTextAr: string;
  customCss: string;
}

const DEFAULT_SETTINGS: SiteBrandingSettings = {
  logoUrl: null,
  logoHeightPx: 42,
  brandNameAr: 'أكاديمية سمارتك',
  brandNameEn: 'SmartTech Academy',
  brandTaglineAr: 'أكاديمية الروبوتات والذكاء الاصطناعي للناشئين',
  primaryColorHex: '#dc2626', // Red 600
  accentColorHex: '#f59e0b', // Amber 500
  fontFamily: 'Cairo',
  announcementTextAr: '🎉 خصم 20% لفترة محدودة على التسجيل المبكر بالمقر الرئيسي بزيزينيا الإسكندرية!',
  announcementBgColorHex: '#dc2626',
  headerTheme: 'dark',
  footerTextAr: 'جميع الحقوق محفوظة © أكاديمية سمارتك للروبوتات والذكاء الاصطناعي',
  customCss: ''
};

interface BrandingContextType {
  settings: SiteBrandingSettings;
  updateSettings: (newSettings: Partial<SiteBrandingSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  uploadLogoImage: (file: File) => Promise<string>;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smarttech_site_branding_v1';

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteBrandingSettings>(() => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(localData) };
      }
    } catch (e) {
      console.warn('Failed to parse local branding settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with Firestore doc 'settings/branding'
  useEffect(() => {
    const fetchFirestoreSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'branding');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as Partial<SiteBrandingSettings>;
          setSettings((prev) => {
            const merged = { ...prev, ...remoteData };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Could not load branding settings from Firestore:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirestoreSettings();
  }, []);

  // Apply Font & Primary Color CSS Variables dynamically to document body/root
  useEffect(() => {
    // 1. Font Family
    document.body.style.fontFamily = `'${settings.fontFamily}', sans-serif`;

    // 2. CSS variables for colors
    document.documentElement.style.setProperty('--brand-primary', settings.primaryColorHex);
    document.documentElement.style.setProperty('--brand-accent', settings.accentColorHex);

    // 3. Custom CSS tag
    let styleTag = document.getElementById('custom-site-branding-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-site-branding-css';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = settings.customCss || '';
  }, [settings]);

  const updateSettings = async (newSettings: Partial<SiteBrandingSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    try {
      const docRef = doc(db, 'settings', 'branding');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Could not save branding settings to Firestore:', err);
    }
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    try {
      const docRef = doc(db, 'settings', 'branding');
      await setDoc(docRef, DEFAULT_SETTINGS);
    } catch (e) {
      console.warn('Firestore reset error:', e);
    }
  };

  const uploadLogoImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('يرجى رفع صورة بصيغة PNG أو JPG أو WEBP فقط.'));
        return;
      }

      // Max 5MB file size limit for Base64 storage
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const resultUrl = e.target?.result as string;
        if (resultUrl) {
          await updateSettings({ logoUrl: resultUrl });
          resolve(resultUrl);
        } else {
          reject(new Error('تعذر قراءة ملف الصورة.'));
        }
      };
      reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الصورة.'));
      reader.readAsDataURL(file);
    });
  };

  return (
    <BrandingContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefaults,
        uploadLogoImage,
        isLoading
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
