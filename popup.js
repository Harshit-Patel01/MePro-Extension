function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.display = 'block';
  status.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

async function isMeProWebsite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.url.includes('pearson.com');
  } catch (error) {
    console.error('Error checking website:', error);
    return false;
  }
}

async function executeAction(action) {
  try {
    if (!await isMeProWebsite()) {
      showStatus('Please use this extension on Pearson website only', true);
      return;
    }

    console.log('Executing action:', action);
    
    chrome.runtime.sendMessage(
      { type: 'executeScript', action: action },
      function(response) {
        console.log('Action response:', response);
        
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          showStatus('Error: Please refresh the page and try again', true);
          return;
        }

        if (response?.status === 'success') {
          showStatus(`${action} level solved successfully!`);
        } else {
          showStatus(response?.message || 'Unknown error occurred', true);
        }
      }
    );
  } catch (error) {
    console.error('Action error:', error);
    showStatus('Error: Failed to execute action', true);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const isOnPearson = await isMeProWebsite();
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(button => {
    button.disabled = !isOnPearson;
  });
  
  if (!isOnPearson) {
    showStatus('Please open Pearson website to use this extension', true);
  }
});

// Add button event listeners
['Single-Correct', 'Dropdown', 'speaking', 'godMode'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    console.log(`${id} button clicked`);
    executeAction(id);
  });
});