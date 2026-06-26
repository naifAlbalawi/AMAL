# LifeOS Android App

Your expense tracking app built with React + Capacitor, ready for Android.

## 🚀 Build the APK automatically (Free!)

This project includes a **GitHub Actions workflow** that builds the APK for you in the cloud — no Android Studio needed.

### Steps:

1. **Create a GitHub account** (free): https://github.com/signup

2. **Create a new repository**:
   - Go to https://github.com/new
   - Name it `lifeos-android`
   - Make it **Public** (free builds)
   - Click "Create repository"

3. **Upload these files** to the repository:
   - You can drag & drop all files, or use GitHub's web upload
   - Make sure the folder structure is preserved (`.github/workflows/` must exist)

4. **Trigger the build**:
   - Go to the **Actions** tab in your repo
   - Click "Build Android APK" → "Run workflow"
   - Wait ~5 minutes

5. **Download your APK**:
   - Go to the completed workflow run
   - Scroll to "Artifacts" section
   - Download `lifeos-debug-apk`
   - Unzip it — `app-debug.apk` is your installable app!

6. **Install on your phone**:
   - Transfer the APK to your Android phone
   - Tap to install (allow "Unknown sources" if prompted)

---

## 🛠️ Build locally (Alternative)

If you prefer building on your own machine:

```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Add Android platform
npx cap add android

# 4. Sync files
npx cap sync

# 5. Build APK (requires Android SDK + Java 17)
cd android && ./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Features

- Dashboard with KPI widgets (monthly burn, alerts, items tracked)
- Spend breakdown bar charts & donut charts
- Full timeline Gantt view
- Urgent items & upcoming events lists
- 4 spaces: Consumables, Durables, Car, Finances
- List view + Board view (Kanban-style)
- Drag-to-rearrange dashboard widgets
- Touch-optimized for mobile

---

## 📝 Notes

- This builds a **debug APK** (free, no signing needed)
- For Google Play Store, you'd need a signed release build (requires a $25 developer account)
- The debug APK works perfectly for personal use
