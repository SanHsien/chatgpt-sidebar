// background.js
// This service worker sets up dynamic rules to remove security headers
// that would otherwise block ChatGPT from loading in an iframe. It also
// configures the side panel to open when the extension icon is clicked.

// When the extension is installed or updated, configure the dynamic
// declarativeNetRequest rules. Removing the content‑security‑policy and
// x‑frame‑options headers allows ChatGPT to render inside the side panel
// iframe. Two separate rules are defined to cover both chat.openai.com
// and chatgpt.com domains.
chrome.runtime.onInstalled.addListener(() => {
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'content-security-policy', operation: 'remove' },
          { header: 'x-frame-options', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: 'https://chat.openai.com/*',
        resourceTypes: ['main_frame', 'sub_frame']
      }
    },
    {
      id: 2,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'content-security-policy', operation: 'remove' },
          { header: 'x-frame-options', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: 'https://chatgpt.com/*',
        resourceTypes: ['main_frame', 'sub_frame']
      }
    }
  ];

  // Remove any existing rules with the same IDs before adding the new ones.
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map((r) => r.id)
  });

  // Ensure that clicking the extension icon opens the side panel.
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Failed to set panel behavior:', error));
});