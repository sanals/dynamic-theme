import React from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from 'next-themes';
import { DesignProvider } from '@/components/providers/design-provider';
import { FontProvider } from '@/components/providers/font-provider';
import { ComparisonProvider } from '@/components/providers/comparison-provider';
import { StandaloneProvider } from './StandaloneProvider';

import { GlobalDesignWidget } from '@/components/global-design-widget';

// The raw CSS string injected by Vite during build
import styles from './styles.css?inline';

class ThemeWidgetElement extends HTMLElement {
  connectedCallback() {
    // 1. Create the Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // 2. Inject Tailwind CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    shadow.appendChild(styleTag);

    // 3. Create the mount point for React
    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);

    // Get the target element from the API (default to documentElement)
    // The widget script will inject css variables to this element.
    const targetElement = (window as any).ThemeWidget?._config?.targetElement || (() => document.documentElement);

    // 4. Render the Widget inside the Shadow DOM
    const root = createRoot(mountPoint);
    
    root.render(
      <React.StrictMode>
        {/* We use our Shimmed ThemeProvider so the widget compiles, but it doesn't affect the host */}
        <ThemeProvider>
          {/* We use our custom StandaloneProvider to handle custom colors and inject them into the host */}
          <StandaloneProvider targetElement={targetElement}>
            <DesignProvider>
              <FontProvider>
                <ComparisonProvider>
                  <div className="antialiased">
                    <GlobalDesignWidget isStandalone={true} />
                  </div>
                </ComparisonProvider>
              </FontProvider>
            </DesignProvider>
          </StandaloneProvider>
        </ThemeProvider>
      </React.StrictMode>
    );
  }
}

// Register the web component
if (!customElements.get('theme-widget')) {
  customElements.define('theme-widget', ThemeWidgetElement);
}

// Define the Vanilla JS API
(window as any).ThemeWidget = {
  _config: {},
  init(config: { targetElement?: () => HTMLElement } = {}) {
    this._config = config;
    
    // Check if the component is already on the page
    if (!document.querySelector('theme-widget')) {
      const widget = document.createElement('theme-widget');
      document.body.appendChild(widget);
    }
  }
};
