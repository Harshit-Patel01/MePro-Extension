chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'executeScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
      if (!tabs[0]?.id) {
        sendResponse({ status: 'error', message: 'No active tab found' });
        return;
      }

      try {
        // Get all frames in the tab
        const frames = await chrome.webNavigation.getAllFrames({ tabId: tabs[0].id });
        console.log('Found frames:', frames);

        // Find the content frame
        const contentFrame = frames?.find(frame => 
          frame.url.includes('content.mepro.pearson.com')
        );
        


        if (!contentFrame) {
          sendResponse({ 
            status: 'error', 
            message: 'Content frame not found.' 
          });
          return;
        }
        // Execute script in the content frame
        const result = await chrome.scripting.executeScript({
          target: { 
            tabId: tabs[0].id,
            frameIds: [contentFrame.frameId]
          },
          func: (action) => {
            console.log('Injected script running with action:', action);
            
            // Create and dispatch the event
            const event = new CustomEvent('solveQuestion', { 
              detail: { action: action }
            });
            
            // Dispatch the event and log the result
            const dispatched = document.dispatchEvent(event);
            console.log('Event dispatched:', dispatched);
            
            return { dispatched };
          },
          args: [request.action]
        });

        console.log('Script execution result:', result);
        sendResponse({ status: 'success', message: 'Action executed' });
      } catch (error) {
        console.error('Execution error:', error);
        sendResponse({ 
          status: 'error', 
          message: `Failed to execute in content frame: ${error.message}` 
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});