# Mystic Tarot 🔮

78枚フルデッキの本格タロット占いPWA。iPhoneのホーム画面に追加してアプリのように使えます。

## 機能

- **4種類のスプレッド** — ワンオラクル / スリーカード(過去・現在・未来) / 二者択一 / ケルト十字(10枚)
- **78枚すべてに日本語の詳しい解説** — キーワード、カードの物語と象徴、正位置・逆位置の意味、恋愛・仕事への当てはめ(大アルカナ)、アドバイス
- **スプレッドの位置ごとの読み方ガイド** — タロットが読めなくても大丈夫
- **総合リーディング** — 大アルカナの割合・スートの偏り・逆位置の数から全体の流れを解説
- **カード図鑑** — 全78枚をいつでも閲覧(スート別フィルタ付き)
- **学ぶタブ** — タロットの基礎知識、数札・人物札の読み方のコツ、良い質問の立て方
- **オフライン対応PWA** — 一度開けば電波のない場所でも動作

## GitHub Pages への公開手順

1. GitHubで新しいリポジトリを作成(例: `tarot-app`、Public)
2. このフォルダの中身をすべてアップロード

   ```bash
   cd tarot-app
   git init
   git add .
   git commit -m "Mystic Tarot PWA"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/tarot-app.git
   git push -u origin main
   ```

3. リポジトリの **Settings → Pages** を開き、
   **Source: Deploy from a branch / Branch: main / (root)** を選んで Save
4. 数分後、`https://<ユーザー名>.github.io/tarot-app/` で公開されます

※ すべてのパスを相対パスにしてあるので、リポジトリ名が何でもそのまま動きます。

## iPhoneでのインストール(PWA)

1. **Safari** で公開URLを開く(Chromeではなく Safari で)
2. 共有ボタン(□↑)をタップ
3. **「ホーム画面に追加」** を選択
4. ホーム画面のアイコンから起動すると、全画面のアプリとして動作します

## 更新時の注意

ファイルを更新して再デプロイしたら、`sw.js` の先頭にあるキャッシュ名
`mystic-tarot-v1` の数字を上げてください(例: `v2`)。
古いキャッシュが破棄され、利用者に最新版が届きます。

## 構成

```
index.html          画面構造
style.css           スタイル(ホワイト&ゴールドの上品なテーマ)
js/cards-major.js   大アルカナ22枚の解説データ
js/cards-minor.js   小アルカナ56枚の解説データ
js/spreads.js       スプレッド定義(位置ごとの読み方ガイド)
js/cardart.js       カード絵柄のSVG生成
js/app.js           アプリ本体
manifest.json       PWAマニフェスト
sw.js               Service Worker(オフラインキャッシュ)
icons/              アプリアイコン
```

## 免責

このアプリは娯楽・自己内省を目的としたものです。健康・法律・金銭に関わる重要な判断は専門家にご相談ください。
