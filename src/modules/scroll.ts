import type { PlausibleFn } from "..";

export function scroll(trackEvent: PlausibleFn, { apiHost, domain }: { apiHost?: string; domain?: string }) {
  const footer = document.querySelector('footer') ?? document.getElementById('footer');
  if (footer) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // If the page isn't long enough to scroll, don't track
        if (window.scrollY > 0) trackEvent('Scroll to bottom');
        observer.disconnect();
      }
    }, { threshold: 1 });
    observer.observe(footer);
  }

  let scroll = 0;
  let scrollChanged = true;
  let firstEvent = true;
  document.addEventListener('scroll', () => {
    const currentScroll = Math.round(window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100);
    if (!scrollChanged && Math.max(scroll, currentScroll) !== scroll) scrollChanged = true;
    scroll = Math.max(scroll, currentScroll);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState == 'hidden' && scrollChanged) {
      // We need to send this using the beacon API as this happens as the tab is closing
      navigator.sendBeacon(`${apiHost ??
        'https://plausible.io'
        }/api/event`, JSON.stringify({
          "n": "Scroll depth",
          "u": location.href,
          "d": domain ?? this.location.hostname,
          "r": document.referrer || null,
          "p": {
            value: scroll,
            firstEvent,
            width: window.innerWidth, // Screen width as content can be presented differently on mobile
          },
        }));

      firstEvent = false;
      scrollChanged = false;
    }
  });
}
