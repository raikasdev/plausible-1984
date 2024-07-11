# Plausible 1984

*plausible-1984* is an [Plausible Analytics](https://plausible.io) script that tracks more information about your visitors to help with development such as:

- Page speed performance and Web Vitals
- Color scheme preference (dark/light)
- Prefers reduced motion, contrast... (accessibility)
- Screen size
- Browser locale
- Network type (simple estimate of network speed "4g", "3g", "2g" or "simple-2g", [read more](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType))
- Page scroll depth and scroll to end

## Usage

Import the script after the Plausible script.
You can use the addons you want, but at least `manual` is required.

```html
<script src="https://plausible.io/js/script.manual.js" async defer data-domain="yourdomain.tld"></script>
<script src="../path/to/plausible-1984.js" async defer></script>
```

The scroll depth uses a manual `navigator.sendBeacon` call in order to send data reliably on page close, so if you aren't using SaaS Plausible or the same domain, you need to also provide `data-api=https://plausible.yourdomain.tld` and/or `data-domain="yourdomain.tld"`.

## Size

As this includes the web-vitals library and is quite a bit of code, the file is 8.89 KB unpacked, 3.34 KB gzipped and 2.96 KB brotli'd. And this doesn't include Plausible, but that's tiny.