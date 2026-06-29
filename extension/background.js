chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Cannot inject into chrome:// or edge:// URLs
    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://'))) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("Theme Widget cannot be injected into browser settings pages. Please go to a normal website like youtube.com first.")
      }).catch(e => console.error(e));
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'ISOLATED',
      files: ['theme-widget.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed: ", chrome.runtime.lastError.message);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'ISOLATED',
          func: (msg) => alert("Widget injection failed: " + msg),
          args: [chrome.runtime.lastError.message]
        }).catch(e => console.error(e));
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'ISOLATED',
          func: () => {
            if (window.ThemeWidget) {
              window.ThemeWidget.toggle({
                targetElement: () => document.documentElement
              });
              console.log("Widget toggled via Extension!");
            } else {
              alert("Theme Widget failed to initialize. Check console.");
            }
          }
        });
      }
    });
  }
});
