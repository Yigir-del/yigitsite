/**
 * Google Analytics GA4 — Hafif, tip-güvenli yardımcı katman.
 * Hiçbir npm paketi gerekmez; gtag index.html'de async olarak yüklendi.
 *
 * Kullanım:
 *   import { trackPageView, trackEvent } from '../utils/analytics';
 *   trackPageView('/hakkimda', 'Hakkımda | Yiğit Altuntaş');
 *   trackEvent('click', { category: 'outbound', label: 'GitHub' });
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = 'G-7J6EVCM1BV';

/**
 * Sayfa görüntülenmesini GA4'e gönderir.
 * React Router route değişimlerinde çağrılmalı.
 */
export function trackPageView(path: string, title?: string): void {
  // gtag henüz yüklenmediyse sessizce geç — async load yarışı önlemi
  if (typeof window.gtag !== 'function') return;

  window.gtag('config', GA_ID, {
    page_path: path,
    ...(title ? { page_title: title } : {}),
  });
}

/**
 * Özel olay gönderir.
 * @param name  GA4 event adı (snake_case önerilir)
 * @param params  Opsiyonel event parametreleri
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params ?? {});
}
