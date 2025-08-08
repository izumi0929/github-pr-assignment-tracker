async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["github_token"], (result) => {
      resolve(result.github_token || "");
    });
  });
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['github_token', 'hidden_authors'], (result) => {
      resolve({
        token: result.github_token || '',
        hiddenAuthors: result.hidden_authors || []
      });
    });
  });
}

async function getUsername(token) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.login || null;
  } catch (_e) {
    return null;
  }
}

async function checkAssignedPRs() {
  const token = await getToken();
  if (!token) {
    chrome.action.setIcon({ path: "icon_default.png" });
    return;
  }

  const settings = await getSettings();

  try {
    const username = await getUsername(token);
    if (!username) {
      chrome.action.setIcon({ path: "icon_default.png" });
      return;
    }

    const API_URL = `https://api.github.com/search/issues?q=is:pr+is:open+draft:false+review-requested:${encodeURIComponent(
      username
    )}`;

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      chrome.action.setIcon({ path: "icon_default.png" });
      return;
    }

    const data = await res.json();
   
    const filteredPRs = data.items.filter(pr => {
      return !settings.hiddenAuthors.includes(pr.user.login);
    });
    if (filteredPRs && filteredPRs.length > 0) {
      chrome.action.setIcon({ path: "icon_notification.png" });
    } else {
      chrome.action.setIcon({ path: "icon_default.png" });
    }
  } catch (error) {
    chrome.action.setIcon({ path: "icon_default.png" });
  }
}

function ensureAlarm() {
  // Create or update an alarm to run every 5 minutes
  chrome.alarms.create("checkAssignedPRs", { periodInMinutes: 5 });
}

// Keep service worker alive by responding to messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "alive" });
  } else if (request.action === "checkPRs") {
    checkAssignedPRs().then(() => {
      sendResponse({ status: "checked" });
    });
    return true; // Keep message channel open for async response
  }
});

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  // Run once on install/update
  checkAssignedPRs();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  // Run once on browser startup
  checkAssignedPRs();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm && alarm.name === "checkAssignedPRs") {
    checkAssignedPRs();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.github_token) {
    // Token updated, re-check immediately
    checkAssignedPRs();
  }
});

// Initial setup
ensureAlarm();
checkAssignedPRs(); 