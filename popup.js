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

async function fetchAssignedPRs() {
  // Wake up the service worker and trigger a check
  try {
    chrome.runtime.sendMessage({ action: "checkPRs" });
  } catch (e) {
    console.log("Could not message background script:", e);
  }

  const settings = await getSettings();
  const prList = document.getElementById('pr-list');
  if (!settings.token) {
    prList.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p style="color: #dc3545; font-weight: bold;">${await i18n.t('no_token')}</p>
        <p>${await i18n.t('set_token_message')}</p>
      </div>
    `;
    return;
  }

  try {
    // まずユーザー情報を取得
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${settings.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!userRes.ok) {
      prList.innerText = await i18n.t('user_info_error');
      return;
    }
    
    const userData = await userRes.json();
    const username = userData.login;
    
    // ユーザー名を使ってPRを検索（draftのPRを除外）
    const API_URL = `https://api.github.com/search/issues?q=is:pr+is:open+draft:false+review-requested:${username}`;
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${settings.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      prList.innerText = `${await i18n.t('pr_fetch_error')}: ${errorData.message || res.statusText}`;
      return;
    }
    
    const data = await res.json();
    prList.innerHTML = '';
    if (data.items && data.items.length > 0) {
      // 非表示設定を適用してフィルタリング
      const filteredPRs = data.items.filter(pr => {
        return !settings.hiddenAuthors.includes(pr.user.login);
      });
      
      if (filteredPRs.length > 0) {
        filteredPRs.forEach(pr => {
          const div = document.createElement('div');
          div.className = 'pr-item';
          div.innerHTML = `<a href="${pr.html_url}" target="_blank" style="color: #4D4EC4;">${pr.title}</a><br><small style="display: flex; align-items: center; gap: 4px;">${pr.repository_url.replace('https://api.github.com/repos/','')} (by <img src="https://github.com/${pr.user.login}.png" width="12" height="12" style="border-radius: 50%;"> ${pr.user.login})</small>`;
          prList.appendChild(div);
        });
        chrome.action.setIcon({ path: 'icon_notification.png' });
      } else {
        prList.innerText = await i18n.t('no_visible_prs');
        chrome.action.setIcon({ path: 'icon_default.png' });
      }
    } else {
      prList.innerText = await i18n.t('no_assigned_prs');
      chrome.action.setIcon({ path: 'icon_default.png' });
    }
  } catch (error) {
    prList.innerText = `${await i18n.t('error_occurred')}: ${error.message}`;
  }
}

// Initialize UI with current language
async function initializeUI() {
  await i18n.updatePageContent();
  
  // Update text content
  document.getElementById('title').textContent = await i18n.t('assigned_prs');
  document.getElementById('loading').textContent = await i18n.t('loading');
  document.getElementById('refresh').textContent = await i18n.t('refresh');
  document.getElementById('settings').textContent = await i18n.t('settings');
  
  // Fetch PRs
  await fetchAssignedPRs();
}

document.getElementById('refresh').addEventListener('click', fetchAssignedPRs);
document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
});
window.onload = initializeUI; 