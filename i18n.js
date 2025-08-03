// Internationalization utility
const i18n = {
  // Language detection
  getCurrentLanguage() {
    // Get language from storage or browser locale
    return new Promise((resolve) => {
      chrome.storage.sync.get(['language'], (result) => {
        if (result.language) {
          resolve(result.language);
        } else {
          // Use browser locale as default
          const browserLang = navigator.language || navigator.userLanguage;
          const lang = browserLang.startsWith('ja') ? 'ja' : 'en';
          resolve(lang);
        }
      });
    });
  },

  // Set language
  setLanguage(lang) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ language: lang }, resolve);
    });
  },

  // Translation data
  translations: {
    ja: {
      // Popup
      'assigned_prs': 'アサインされたPR',
      'loading': '読み込み中...',
      'refresh': '更新',
      'settings': '設定',
      'no_token': 'GitHubトークンが未設定です❗️',
      'set_token_message': '設定ボタンをクリックしてトークンを設定してください❗️',
      'user_info_error': 'ユーザー情報の取得に失敗しました 😭',
      'pr_fetch_error': 'PRの取得に失敗しました 😭',
      'no_assigned_prs': 'アサインされたPRはありません🎉',
      'no_visible_prs': '表示可能なPRはありません 🎉',
      'error_occurred': 'エラーが発生しました 😭',
      
      // Options
      'settings_title': 'GitHub PR Assignment Tracker 設定',
      'token_section': 'GitHubトークン設定',
      'personal_access_token': 'Personal Access Token:',
      'token_help': 'GitHubのSettings > Developer settings > Personal access tokens > Tokens (classic)でトークンを生成してください。',
      'hidden_section': '非表示設定',
      'hidden_authors_label': '非表示にするPRの作成者（1行に1つ）:',
      'hidden_authors_help': '指定したユーザー名のPRは表示されません。 例：renovate[bot]、dependabot[bot]など',
      'save': '保存',
      'saved': '保存しました❗️',
      'language_section': '言語設定',
      'language_label': '言語:',
      'japanese': '日本語',
      'english': 'English'
    },
    en: {
      // Popup
      'assigned_prs': 'Assigned PRs',
      'loading': 'Loading...',
      'refresh': 'Refresh',
      'settings': 'Settings',
      'no_token': 'GitHub token is not set❗️',
      'set_token_message': 'Click the settings button to configure the token❗️',
      'user_info_error': 'Failed to get user information 😭',
      'pr_fetch_error': 'Failed to fetch PRs 😭',
      'no_assigned_prs': 'No assigned PRs 🎉',
      'no_visible_prs': 'No visible PRs 🎉',
      'error_occurred': 'An error occurred 😭',
      
      // Options
      'settings_title': 'GitHub PR Assignment Tracker Settings',
      'token_section': 'GitHub Token Settings',
      'personal_access_token': 'Personal Access Token:',
      'token_help': 'Generate a token at GitHub Settings > Developer settings > Personal access tokens > Tokens (classic).',
      'hidden_section': 'Hidden Settings',
      'hidden_authors_label': 'PR authors to hide (one per line):',
      'hidden_authors_help': 'PRs from specified usernames will not be displayed. Examples: renovate[bot], dependabot[bot], etc.',
      'save': 'Save',
      'saved': 'Saved❗️',
      'language_section': 'Language Settings',
      'language_label': 'Language:',
      'japanese': '日本語',
      'english': 'English'
    }
  },

  // Get translation
  async t(key) {
    const lang = await this.getCurrentLanguage();
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  },

  // Update page content
  async updatePageContent() {
    const lang = await this.getCurrentLanguage();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update title
    const title = document.querySelector('title');
    if (title) {
      title.textContent = lang === 'ja' ? 'GitHub PR Assignment Tracker' : 'GitHub PR Assignment Tracker';
    }
  }
}; 