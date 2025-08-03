document.addEventListener('DOMContentLoaded', async () => {
  const tokenInput = document.getElementById('token');
  const hiddenAuthorsInput = document.getElementById('hiddenAuthors');
  const msg = document.getElementById('msg');
  
  // Initialize UI with current language
  await i18n.updatePageContent();
  await updateUIText();
  
  // Load saved settings
  chrome.storage.sync.get(['github_token', 'hidden_authors', 'language'], (result) => {
    if (result.github_token) {
      tokenInput.value = result.github_token;
    }
    if (result.hidden_authors) {
      hiddenAuthorsInput.value = result.hidden_authors.join('\n');
    }
    if (result.language) {
      document.querySelector(`input[name="language"][value="${result.language}"]`).checked = true;
    } else {
      // Set default based on browser locale
      const browserLang = navigator.language || navigator.userLanguage;
      const defaultLang = browserLang.startsWith('ja') ? 'ja' : 'en';
      document.querySelector(`input[name="language"][value="${defaultLang}"]`).checked = true;
    }
  });
  
  // Language change handler
  document.querySelectorAll('input[name="language"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      await i18n.setLanguage(e.target.value);
      await updateUIText();
    });
  });
  
  document.getElementById('save').addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const hiddenAuthors = hiddenAuthorsInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    const language = document.querySelector('input[name="language"]:checked').value;
    
    chrome.storage.sync.set({ 
      github_token: token,
      hidden_authors: hiddenAuthors,
      language: language
    }, async () => {
      msg.textContent = await i18n.t('saved');
      setTimeout(() => { msg.textContent = ''; }, 2000);
    });
  });
});

async function updateUIText() {
  // Update all text content
  document.getElementById('settings-title').textContent = await i18n.t('settings_title');
  document.getElementById('token-section').textContent = await i18n.t('token_section');
  document.getElementById('token-label').textContent = await i18n.t('personal_access_token');
  document.getElementById('token-help').textContent = await i18n.t('token_help');
  document.getElementById('hidden-section').textContent = await i18n.t('hidden_section');
  document.getElementById('hidden-label').textContent = await i18n.t('hidden_authors_label');
  document.getElementById('hidden-help').textContent = await i18n.t('hidden_authors_help');
  document.getElementById('language-section').textContent = await i18n.t('language_section');
  document.getElementById('language-label').textContent = await i18n.t('language_label');
  document.getElementById('japanese-text').textContent = await i18n.t('japanese');
  document.getElementById('english-text').textContent = await i18n.t('english');
  document.getElementById('save').textContent = await i18n.t('save');
} 