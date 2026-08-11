/**
 * SmartTech Academy Domain Navigation Service
 * Main Website: https://smart-courses.org
 * App Platform: https://app.smart-courses.org
 */

export const MAIN_WEBSITE_DOMAIN = 'smart-courses.org';
export const APP_PLATFORM_DOMAIN = 'app.smart-courses.org';

export const MAIN_WEBSITE_URL = 'https://smart-courses.org';
export const APP_PLATFORM_URL = 'https://app.smart-courses.org';

export function isAppPlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === APP_PLATFORM_DOMAIN || window.location.hostname.startsWith('app.');
}

export function isMainWebsite(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === MAIN_WEBSITE_DOMAIN || (!isAppPlatform() && !window.location.hostname.includes('localhost'));
}

export function getAppPlatformTabUrl(tabId: string): string {
  // If running in development / sandbox or single host, stay in current page with state/hash
  if (typeof window !== 'undefined' && !window.location.hostname.endsWith('smart-courses.org')) {
    return `#${tabId}`;
  }
  return `${APP_PLATFORM_URL}?tab=${tabId}`;
}

export function navigateToAppPlatform(tabId: string = 'dashboard'): void {
  if (typeof window === 'undefined') return;
  if (!window.location.hostname.endsWith('smart-courses.org')) {
    // Single SPA mode in sandbox/preview
    const event = new CustomEvent('navigate-tab', { detail: { tab: tabId } });
    window.dispatchEvent(event);
  } else {
    window.location.href = `${APP_PLATFORM_URL}?tab=${tabId}`;
  }
}

export function navigateToMainWebsite(path: string = '/'): void {
  if (typeof window === 'undefined') return;
  if (!window.location.hostname.endsWith('smart-courses.org')) {
    const event = new CustomEvent('navigate-tab', { detail: { tab: 'home' } });
    window.dispatchEvent(event);
  } else {
    window.location.href = `${MAIN_WEBSITE_URL}${path}`;
  }
}
