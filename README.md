# ちいかわの街

ブラウザで遊べる静的サイトです。HTML / CSS / JavaScript だけで構成されているため、GitHub Pages や Netlify などの静的サイトホスティングで公開できます。

## 公開方法

### 1. Netlify に公開する

- このフォルダ全体をそのまま Netlify にドラッグ&ドロップする
- または GitHub に push して、Netlify でリポジトリを接続する
- Publish directory は "chiikawa-town" を指定する

### 2. GitHub Pages に公開する

- このアプリを GitHub のリポジトリに push する
- GitHub の Settings → Pages を開く
- Build and deployment で "GitHub Actions" を選択する
- このリポジトリに含まれている Pages 用の workflow が自動で実行される

## ローカル確認

ブラウザで index.html を直接開いても動きますが、音声やファイル読み込みの確認にはローカルサーバーのほうが安定します。

例:
- Python なら: python -m http.server 8000
- ブラウザで http://localhost:8000/chiikawa-town/ を開く

## 収録されているファイル

- index.html
- style.css
- script.js
- pic/

画像ファイルは pic フォルダ内に入っています。
