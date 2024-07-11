import { onLCP, onINP, onCLS, type Metric } from 'web-vitals';
import { scroll } from './modules/scroll';

export type PlausibleFn = (eventName: string, settings?: { props: Record<string, string | number | boolean | null> }) => void;
declare var window: Window & typeof globalThis & { plausible: PlausibleFn & { q: Parameters<PlausibleFn>[] } };
declare var plausible: PlausibleFn;

(() => {
  window.plausible = window.plausible || ((...args: Parameters<PlausibleFn>) => {
    (window.plausible.q = window.plausible.q || []).push(args)
  });

  // Function contains code licensed under APACHE-2.0 https://github.com/cronitorio/cronitor-rum-js
  function getTimings() {
    try {
      if (window.performance) {
        const entry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (entry) {
          const timings = {
            page_load_dns: entry.domainLookupEnd - entry.domainLookupStart,
            page_load_connect: entry.connectEnd - entry.connectStart,
            page_load_ssl: entry.secureConnectionStart
              ? entry.requestStart - entry.secureConnectionStart
              : undefined,
            page_load_ttfb: entry.responseStart - entry.requestStart,
            page_load_download: entry.responseEnd - entry.responseStart,
            page_load_dom_content_loaded:
              entry.domContentLoadedEventEnd - entry.responseEnd,
            page_load_render: entry.domComplete - entry.domContentLoadedEventEnd,
            page_load_total: entry.loadEventStart,
            page_load_transfer_size: entry.transferSize,
          };

          // Round all values
          Object.keys(timings).forEach((key) => timings[key] = Math.round(timings[key]));

          return timings;
        }
      }
    } catch (e) { }
    return null;
  }

  function getPrefersContrast(): 'more' | 'less' | 'custom' | 'no-preference' {
    if (window.matchMedia) {
      // This is very likely the most common case, so lets try it first
      if (window.matchMedia('(prefers-contrast: no-preference)').matches) return 'no-preference';
      if (window.matchMedia('(prefers-contrast: more)').matches) return 'more';
      if (window.matchMedia('(prefers-contrast: less)').matches) return 'less';
      if (window.matchMedia('(prefers-contrast: custom)').matches) return 'custom';
    }
    return 'no-preference';
  }

  // Page view event
  window.addEventListener('load', () => {
    try {
      plausible('pageview', {
        props: ({
          colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'none'),
          prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
          invertedColors: window.matchMedia('(inverted-colors: inverted)').matches,
          prefersContrast: getPrefersContrast(),

          browserLocale: navigator.language,
          screenResolution: (screen?.width && screen?.height) ? `${screen.width}x${screen.height}` : null,
          connectionType: ('connection' in navigator) ? (navigator.connection as { effectiveType: string }).effectiveType : null,
          ...getTimings(),
        }),
      });
    } catch (e) {
      console.error('Failed to gather page view data', e);
      plausible('pageview'); // Retry without data
    }
  });

  scroll(plausible, {
    apiHost: document.currentScript?.getAttribute('data-api') ?? undefined,
    domain: document.currentScript?.getAttribute('data-domain') ?? undefined,
  });

  // Web vitals
  function trackWebVital(name: string, fn: (cb: (metric: Metric) => void) => void) {
    fn((metric) => plausible(`Web Vitals: ${name}`, {
      props: {
        value: Math.round(metric.value),
        rating: metric.rating,
      }
    }));
  }

  trackWebVital('CLS', onCLS);
  trackWebVital('INP', onINP);
  trackWebVital('LCP', onLCP);
})();

