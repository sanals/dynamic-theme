import React from 'react';
import { createRoot } from 'react-dom/client';

import { FontProvider } from './font-provider';
import { ComparisonProvider } from './comparison-provider';
import { WidgetStateProvider } from './WidgetStateProvider';

import { GlobalDesignWidget } from '@/components/global-design-widget';

// The raw CSS string injected by Vite during build
import styles from './styles.css?inline';

// We use a regular div with a ShadowRoot instead of a Custom Element.
// This bypasses issues on sites like YouTube that have messy Web Component polyfills
// and avoids errors in Chrome Extension Isolated Worlds where customElements might be null.

function createWidget(targetElement: () => HTMLElement) {
  if (document.getElementById('vantage-theme-widget-container')) return;

  const container = document.createElement('div');
  container.id = 'vantage-theme-widget-container';
  
  // 1. Create the Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // 2. Inject Tailwind CSS
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  shadow.appendChild(styleTag);

  // 3. Create the mount point for React
  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  // 4. Mount to page
  document.body.appendChild(container);

  // 5. Render the Widget inside the Shadow DOM
  const root = createRoot(mountPoint);
  
  root.render(
    <React.StrictMode>
      <WidgetStateProvider targetElement={targetElement}>
        <FontProvider>
          <ComparisonProvider>
            <div className="antialiased">
              <GlobalDesignWidget isStandalone={true} />
            </div>
          </ComparisonProvider>
        </FontProvider>
      </WidgetStateProvider>
    </React.StrictMode>
  );
}

// Define the Vanilla JS API
(window as any).ThemeWidget = {
  _config: {},
  init(config: { targetElement?: () => HTMLElement } = {}) {
    this._config = config;
    const targetElement = config.targetElement || (() => document.documentElement);
    createWidget(targetElement);
  }
};
