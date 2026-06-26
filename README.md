# AMAL | أمل

Expense tracking app built with React + Capacitor, ready for Android.

## 🚀 Build APK automatically (Free!)

1. Create a GitHub account (free): https://github.com/signup
2. Create a new public repository named `amal-app`
3. Upload all these files (preserve folder structure)
4. Go to **Actions** tab → **Build Android APK** → **Run workflow**
5. Wait ~5 minutes, then download `amal-debug-apk` artifact

## 🛠️ Build locally

```bash
npm install
npm run build
npx cap add android
npx cap sync
# Open Android Studio: npx cap open android
# Or build: cd android && ./gradlew assembleDebug
```

## Features

- Unified expenses with dynamic tag groups
- Invoice OCR with multi-item extraction
- Property / ممتلكات management with linked expenses
- Bilingual: Arabic (Tajawal font, RTL) + English
- Gantt timeline centered on today (±1 month)
- Dashboard with KPIs and spend breakdown
- Export/Import JSON backups

## AI OCR

Open `src/utils/ocr.js` and set `USE_AI_OCR = true`, then implement your API call.
