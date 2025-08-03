# GitHub PR Assignment Tracker

このChrome拡張は、あなたにアサインされているGitHubのPull Requestを一覧表示します


## 使い方

1. Chromeの拡張機能として `tools/github-pr-assignments` フォルダを読み込んでください。
2. 「設定」画面からGitHubトークンと、非表示にするPR作成者を設定します。
4. 拡張のアイコンをクリックすると、アサインされているPRが表示されます。
3. 「更新」ボタンで再取得できます。

## トークンの設定方法
- 拡張の「オプション」ページからGitHubトークンを入力・保存してください。
- トークンはchrome.storageに安全に保存されます。


# GitHub PR Assignment Tracker

This Chrome extension tracks your assigned GitHub PRs.

## Usage

1. Install the Chrome extension by loading the tools/github-pr-assignments folder.
2. Configure your GitHub token and specify PR authors to hide in the "Settings" screen.
3. Click the extension icon to display your assigned pull requests.
4. Click "Refresh" to update the PR list.

## How to set Token
- Please enter and save your GitHub token on the extension's "Settings" page.
- Your token is safely stored using chrome.storage.