function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['github_token'], (result) => {
      resolve(result.github_token || '');
    });
  });
}

async function checkAssignedPRs() {
  const token = await getToken();
  if (!token) {
    chrome.action.setIcon({ path: 'icon_default.png' });
    return;
  }
  const API_URL = 'https://api.github.com/search/issues?q=is:pr+is:open+assignee:@me';
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!res.ok) {  
      chrome.action.setIcon({ path: 'icon_default.png' });
      return;
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      chrome.action.setIcon({ path: 'icon_notification.png' });
    } else {
      chrome.action.setIcon({ path: 'icon_default.png' });
    }
  } catch (e) {
    chrome.action.setIcon({ path: 'icon_default.png' });
  }
}

setInterval(checkAssignedPRs, 5 * 60 * 1000);
checkAssignedPRs(); 