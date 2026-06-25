# Dynamic Themeable Widget

A standalone, injectable widget that provides an interactive UI to modify the visual theme (colors, radius, and fonts) of any web application in real-time. It uses a Shadow DOM to encapsulate its own styling, ensuring it never conflicts with the host website's CSS.

## 🚀 Getting Started

### 1. Build the Widget
To generate the production-ready scripts (including the Chrome Extension), run:
```bash
npm install
npm run build:ext
```
This will compile the widget into a single file located at `dist/theme-widget.js`, and also generate a ready-to-use Chrome Extension in the `extension/` folder.

### 2. Add it to Your Project

#### Option A: Vanilla HTML / Standard Websites
Copy the `dist/theme-widget.js` file to your project's public directory. Then, simply add these tags just before the closing `</body>` tag of your HTML file:

```html
<!-- Load the widget code -->
<script src="/theme-widget.js"></script>

<!-- Initialize it -->
<script>
  window.addEventListener('load', () => {
    if (window.ThemeWidget) {
      window.ThemeWidget.init();
    }
  });
</script>
```

#### Option B: Next.js (App Router)
For modern React frameworks like Next.js, copy `dist/theme-widget.js` into your `/public` folder. Then, inject the script globally by modifying your `app/layout.tsx`:

```tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Load the widget script lazily */}
        <Script src="/theme-widget.js" strategy="lazyOnload" />
        
        {/* Safely initialize the widget once loaded */}
        <Script id="theme-widget-init" strategy="lazyOnload">
          {\`
            let attempts = 0;
            const initWidget = () => {
              if (window.ThemeWidget) {
                window.ThemeWidget.init();
              } else if (attempts < 50) {
                attempts++;
                setTimeout(initWidget, 100);
              }
            };
            initWidget();
          \`}
        </Script>
      </body>
    </html>
  )
}
```

### 3. Testing via Chrome Extension (Recommended for Secure Sites)
Some highly secure websites (like YouTube, LinkedIn, Pinterest) enforce strict Content Security Policies (CSP) or Trusted Types that block scripts injected via the console. To test the widget on these sites, use the bundled Chrome Extension:

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** (top right corner).
3. Click **Load unpacked** and select the `extension` folder in this project's directory.
4. Pin the **Theme Widget Tester** extension to your toolbar.
5. Navigate to any website and click the extension icon to instantly inject the widget, bypassing all CSP restrictions.

### 4. Live-injecting via Browser Console (Quick Test)
For sites without strict CSP:
1. Serve the `dist` folder locally with CORS enabled: `npx serve dist -p 8080 -C`
2. Open the target website in Chrome/Edge.
3. Open Developer Tools (F12) -> **Console**.
4. Paste and run:
```javascript
const script = document.createElement('script');
script.src = 'http://localhost:8080/theme-widget.js';
document.head.appendChild(script);

script.onload = () => {
    window.ThemeWidget.init();
    console.log("Widget Injected!");
};
```

## 🛠 Features
- **Real-time Palette Editing**: Adjust primary, secondary, background, and accent colors instantly.
- **Multiple Injection Engines**:
  - **Mapper**: Surgically map custom palette colors to specific CSS variables detected on the host website.
  - **Smart (CSSOM)**: Auto-detects hardcoded colors in stylesheets and safely overrides them with your custom theme.
  - **Override (Forcer)**: Aggressively overlays the custom theme using high-specificity rules to force compatibility on stubborn websites.
- **Micro-interactions & Aesthetics**: Premium glassmorphism UI with smooth view transitions.
- **WCAG Contrast Checker**: Built-in accessibility tool that warns you about poor color contrasts and offers a 1-click auto-fix.
- **Copy & Export**: Scan the page for CSS variables, copy them, and export generated palettes as CSS or JSON.
- **Shadow DOM Isolation**: The widget is completely sandboxed inside a secure Shadow DOM, meaning it won't break your site's styles, and your site won't break the widget's styles.

## 📄 How it Works
When initialized, `window.ThemeWidget.init()` injects the React-based widget into the page inside a standard `<div>` with an attached Shadow DOM. This bypasses legacy Web Component polyfills (like those used on YouTube) while maintaining perfect CSS isolation. 
As the user tweaks the design controls, the widget calculates the corresponding Tailwind-compatible CSS variables and injects them directly into the host page's `:root` (or dynamically rewrites stylesheets, depending on the active Engine Mode).
