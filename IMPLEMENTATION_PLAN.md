# MBB Mobile App - CI Implementation Plan

## 📋 Project Overview

| Detail | Description |
|--------|-------------|
| **Project Name** | MBB Mobile App CI Workflows |
| **Organization** | Maybank (MBB) |
| **Objective** | Create CI workflows for iOS and Android mobile applications |
| **Environments** | SIT, Staging, Production |
| **Date** | March 2026 |

---

## 📱 Applications

### App 1: iOS - RegionalApp (React Native)

| Detail | Value |
|--------|-------|
| **Platform** | iOS |
| **Framework** | React Native |
| **Language** | JavaScript/TypeScript + Objective-C |
| **Project File** | `ios/RegionalApp.xcworkspace` |
| **Xcode Project** | `ios/RegionalApp.xcodeproj` |
| **Test Target** | `ios/RegionalAppTests` |
| **Security** | `EnhancedJailbreakDetection.h/.mm` |
| **Runner** | `macos-latest` |

### App 2: Android - RegionalApp (React Native)

| Detail | Value |
|--------|-------|
| **Platform** | Android |
| **Framework** | React Native (0.74.1) — shared codebase with iOS |
| **Language** | JavaScript/TypeScript + Java (native shell) |
| **Build Tool** | Gradle |
| **Project File** | `android/build.gradle` |
| **Settings** | `android/settings.gradle` |
| **Gradle Wrapper** | `android/gradlew` / `android/gradlew.bat` |
| **Gradle Properties** | `android/gradle.properties` |
| **Firebase Config** | `android/app/google-services.json` (from secret) |
| **Runner** | `macos-latest` or `ubuntu-latest` |

> **Note:** Both iOS and Android share the same React Native codebase, `package.json`, and `npm install`. The `android/` folder contains the auto-generated native Android shell that hosts the React Native JavaScript runtime. The actual application logic lives in `src/` at the project root.

---

## 🌍 Environments

| Environment | Purpose | CI Build Type |
|-------------|---------|---------------|
| **SIT** (System Integration Testing) | Developer testing & integration | Debug build |
| **Staging** | Pre-production validation & UAT | Release build (staging config) |
| **Production** | Live release | Release build (production config) |

### CI Build Per Environment

#### iOS

| Environment | Scheme | Export Plist | Signing |
|-------------|--------|-------------|---------|
| **SIT** | `RegionalApp-Dev` | `ExportOptions-Development.plist` | Dev certificate |
| **Staging** | `RegionalApp-Staging` | `ExportOptions-AdHoc.plist` | Dist certificate |
| **Production** | `RegionalApp` | `ExportOptions-AppStore.plist` | Dist certificate |

#### Android

| Environment | Build Variant | Output | Signing |
|-------------|--------------|--------|---------|
| **SIT** | `debug` | APK (`assembleDebug`) | Debug keystore |
| **Staging** | `release` | APK (`assembleRelease`) | Release keystore |
| **Production** | `release` | AAB (`bundleRelease`) | Release keystore |

---

## 🏗️ Implementation Phases

### Phase 1: iOS CI Workflow (React Native)

**File:** `.github/workflows/ios-ci.yml`

#### Pipeline Flow

```
Checkout → Setup Node.js → Install npm packages → Check app version
    → Setup Ruby → Install CocoaPods → Install iOS certificates & profiles
    → Create Xcode keychain → Security Audit → License Check
    → Lint (ESLint) → Jest Unit Tests → iOS Unit Tests (XCTest)
    → Build iOS App (npm run build:ios:*) → Zip .xcarchive
    → Upload .xcarchive artifact → Upload .ipa artifact → Job Summary
```

#### Detailed Steps

| Step | Action | Command/Tool |
|------|--------|-------------|
| 1 | Checkout repository | `actions/checkout@v4` |
| 2 | Set up Node.js | `actions/setup-node@v4` (Node 20) |
| 3 | Install npm dependencies | `npm install` |
| 4 | Check app version | Extract `APP_VERSION_NAME` and `APP_VERSION_CODE` from project config |
| 5 | Set up Ruby | `ruby/setup-ruby@v1` (for CocoaPods) |
| 6 | Install CocoaPods | `cd ios && pod install` |
| 7 | Install iOS certificates from base64 | Decode `IOS_CERTIFICATE_BASE64` → `.p12` file |
| 8 | Install provisioning profiles from base64 | Decode `IOS_PROVISIONING_PROFILE_BASE64` → `.mobileprovision` |
| 9 | Create temporary Xcode keychain | Import certificate into build keychain |
| 10 | Security audit | `npm audit --audit-level=moderate` |
| 11 | License compliance | `npx license-checker --onlyAllow '...'` |
| 12 | Lint (ESLint) | `npm run lint` |
| 13 | Run Jest unit tests | `npm test` |
| 14 | Run iOS unit tests (XCTest) | `xcodebuild test -workspace ios/RegionalApp.xcworkspace -scheme RegionalApp` |
| 15 | Build iOS app | `npm run build:ios:release:staging:appstore` (environment-specific npm script) |
| 16 | Zip .xcarchive file | `zip -r` — tagged with environment + version |
| 17 | Upload .xcarchive artifact | `actions/upload-artifact@v3` — tagged with environment + version |
| 18 | Upload .ipa artifact | `actions/upload-artifact@v3` — tagged with environment + version |
| 19 | Job summary | `$GITHUB_STEP_SUMMARY` |

#### Secrets Required (iOS)

| Secret | Purpose |
|--------|---------|
| `IOS_CERTIFICATE_BASE64` | Apple distribution certificate (.p12) |
| `IOS_CERTIFICATE_PASSWORD` | Certificate password |
| `IOS_PROVISIONING_PROFILE_BASE64` | Provisioning profile |
| `KEYCHAIN_PASSWORD` | Temporary keychain password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

---

### Phase 2: Android CI Workflow (React Native)

**File:** `.github/workflows/android-ci.yml`

> **Note:** Since the Android app is React Native (shared codebase with iOS), the pipeline requires Node.js + npm install to bundle the JavaScript code before Gradle builds the APK/AAB.

#### Pipeline Flow

```
Checkout → Setup Node.js → Install npm packages → Setup Java (JDK 17)
    → Cache Gradle → Check app version → Create local.properties
    → Create google-services.json from base64 → Verify google-services.json
    → Create Android keystore from base64 → Verify keystore exists
    → Install Android SDK components → Verify NDK source.properties
    → Make Gradle executable → Security Scan → Lint → Unit Tests
    → Build AAB → Upload AAB artifact → Build APK → Upload APK artifact
    → Job Summary
```

#### Detailed Steps

| Step | Action | Command/Tool |
|------|--------|-------------|
| 1 | Checkout repository | `actions/checkout@v4` |
| 2 | Set up Node.js | `actions/setup-node@v4` (Node 20) — needed for RN JS bundle |
| 3 | Install npm dependencies | `npm install` — shared React Native codebase |
| 4 | Set up JDK | `actions/setup-java@v4` (JDK 17) |
| 5 | Cache Gradle dependencies | `actions/cache@v3` — `~/.gradle/caches` |
| 6 | Check app version | Extract `APP_VERSION_NAME` and `APP_VERSION_CODE` from `build.gradle` |
| 7 | Create `local.properties` | Write `sdk.dir=$ANDROID_SDK_ROOT` — tells Gradle where the SDK is |
| 8 | Create `google-services.json` from base64 | Decode `GOOGLE_SERVICES_JSON_BASE64` → `android/app/google-services.json` |
| 9 | Verify `google-services.json` exists | `test -f android/app/google-services.json` — fail fast if decode failed |
| 10 | Create Android keystore from base64 | Decode `ANDROID_KEYSTORE_BASE64` → `.jks` file |
| 11 | Verify Android keystore exists | `test -f <keystore_path>` — fail fast if decode failed |
| 12 | Install Android SDK components | `sdkmanager` — install required SDK platforms, build-tools, NDK |
| 13 | Verify NDK `source.properties` | Confirm correct NDK version is installed for native compilation |
| 14 | Make Gradle executable | `chmod +x android/gradlew` |
| 15 | Security scan | `./gradlew dependencyCheckAnalyze` (OWASP) |
| 16 | Lint check | `./gradlew lint` |
| 17 | Run unit tests | `./gradlew test` |
| 18 | Build AAB (App Bundle) | `./gradlew bundleRelease` |
| 19 | Upload AAB artifact | `actions/upload-artifact@v3` — tagged with environment + version, `if-no-files-found: error` |
| 20 | Build APK | `./gradlew assembleRelease` |
| 21 | Upload APK artifact | `actions/upload-artifact@v3` — tagged with environment + version, `if-no-files-found: error` |
| 22 | Job summary | `$GITHUB_STEP_SUMMARY` |

#### Secrets Required (Android)

| Secret | Purpose |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Signing keystore (.jks), base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias name |
| `ANDROID_KEY_PASSWORD` | Key password |
| `GOOGLE_SERVICES_JSON_BASE64` | Firebase `google-services.json`, base64-encoded |

---

### Phase 3: Shared CI Components

| Component | Applies To | Purpose |
|-----------|-----------|---------|
| CodeQL analysis | iOS + Android | Static code security scanning (integrated into both CI workflows) |
| Dependabot | npm + GitHub Actions + Gradle | Weekly automated dependency update PRs |
| Notifications | iOS + Android | Slack/Teams alerts on CI results |
| Branch protection | All | Require CI pass before merge |

---

## 📁 Repository Structure

```
mbb-mobileapp-workflows/
├── .github/
│   ├── dependabot.yml                    # Dependabot weekly dependency updates
│   ├── workflows/
│   │   ├── ios-ci.yml                    # iOS React Native CI pipeline (includes CodeQL job)
│   │   ├── android-ci.yml               # Android React Native CI pipeline (includes CodeQL job)
│   │   └── codeql.yml                   # Standalone CodeQL security scanning (PR/push/schedule)
│
├── ios/                                  # iOS React Native project
│   ├── RegionalApp.xcodeproj/
│   ├── RegionalApp.xcworkspace/
│   ├── RegionalApp/
│   ├── RegionalAppTests/
│   ├── Security/
│   ├── ExportOptions-Development.plist   # SIT build
│   ├── ExportOptions-AdHoc.plist         # Staging build
│   └── ExportOptions-AppStore.plist      # Production build
│
├── android/                              # Android React Native project (native shell)
│   ├── app/
│   │   └── google-services.json          # Firebase config (created from secret at CI)
│   ├── gradle/wrapper/
│   ├── build.gradle
│   ├── gradle.properties
│   ├── settings.gradle
│   ├── link-assets-manifest.json
│   ├── gradlew
│   └── gradlew.bat
│
├── package.json
├── package-lock.json
├── .gitignore
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## 🔄 CI Pipeline Flow

### iOS CI Pipeline

```
Job 1: Install  →  Job 2: Scan    ──→  Job 5: Build iOS
                →  Job 3: Test    ──┘
                   Job 4: CodeQL  ──┘

┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Checkout   │────▶│  Setup Node  │────▶│  npm install │────▶│  pod install │
│   Source     │     │  + Ruby      │     │              │     │  (CocoaPods) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Security  │────▶│    Lint +    │────▶│  Jest Tests  │────▶│  CodeQL SAST │
│   Audit     │     │   License    │     │  (JS/TS)     │     │  (parallel)  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  xcodebuild │────▶│   Archive    │────▶│  Export .ipa │────▶│   Upload to  │
│    build     │     │   .xcarchive │     │              │     │   GitHub Pkg │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

### Android CI Pipeline

```
Job 1: Install  →  Job 2: Scan    ──→  Job 5: Build Android
                →  Job 3: Test    ──┘
                   Job 4: CodeQL  ──┘

┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Checkout   │────▶│  Setup Node  │────▶│  npm install │────▶│  Setup JDK   │
│   Source     │     │  (for RN)    │     │  (shared)    │     │    17        │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ Cache Gradle │────▶│ Check App   │────▶│   Create     │────▶│  Create      │
│              │     │ Version     │     │ local.props  │     │ google-svc   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Verify    │────▶│  Create      │────▶│   Verify     │────▶│ Install SDK  │
│ google-svc  │     │  Keystore    │     │  Keystore    │     │ + NDK        │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ Make Gradle │────▶│  Security    │────▶│  Lint Check  │────▶│  Unit Tests  │
│ Executable  │     │  Scan        │     │  (Android)   │     │  (JUnit)     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ CodeQL SAST │────▶│  Build AAB   │────▶│  Build APK   │────▶│ Upload APK   │
│ (parallel)  │     │ (Production) │     │ (All envs)   │     │  Artifact    │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

---

## 🔐 Security Considerations

| Area | iOS | Android |
|------|-----|---------|
| **Code Signing** | Apple certificates + provisioning profiles | Keystore (.jks) |
| **Jailbreak Detection** | `EnhancedJailbreakDetection.h/.mm` | Root detection (Play Integrity) |
| **Dependency Scanning** | `npm audit` (shared) | `npm audit` (shared) + OWASP Dependency Check |
| **Static Analysis** | CodeQL + ESLint | CodeQL + ESLint (shared JS) + Android Lint |
| **SAST in CI** | CodeQL job (Job 4) gates iOS build | CodeQL job (Job 4) gates Android build |
| **Dependency Updates** | Dependabot weekly (npm, GitHub Actions) | Dependabot weekly (npm, GitHub Actions, Gradle) |
| **License Compliance** | `license-checker` (shared) | `license-checker` (shared) + Gradle license plugin |
| **Firebase Config** | N/A | `google-services.json` from encrypted secret |
| **Secrets Management** | GitHub Encrypted Secrets | GitHub Encrypted Secrets |

---

## ✅ Checklist

### iOS CI Workflow
- [ ] Checkout source code
- [ ] Set up Node.js (v20)
- [ ] Install npm dependencies
- [ ] Check app version (extract `APP_VERSION_NAME` + `APP_VERSION_CODE`)
- [ ] Set up Ruby (for CocoaPods)
- [ ] Install CocoaPods (`cd ios && pod install`)
- [ ] Install iOS certificates from base64 secret
- [ ] Install provisioning profiles from base64 secret
- [ ] Create temporary Xcode keychain
- [ ] Run security audit (`npm audit`)
- [ ] Run license compliance check
- [ ] Lint JavaScript/TypeScript code
- [ ] Run Jest unit tests
- [ ] Run XCTest iOS tests on simulator
- [ ] Build iOS app (`npm run build:ios:release:staging:appstore`)
- [ ] Zip .xcarchive file (version-tagged)
- [ ] Upload .xcarchive artifact (version-tagged, `if-no-files-found: error`)
- [ ] Upload .ipa artifact (version-tagged, `if-no-files-found: error`)
- [ ] Generate job summary

### Android CI Workflow
- [ ] Checkout source code
- [ ] Set up Node.js (v20) — required for React Native JS bundle
- [ ] Install npm dependencies — shared React Native codebase
- [ ] Set up JDK 17
- [ ] Cache Gradle dependencies
- [ ] Check app version (extract `APP_VERSION_NAME` + `APP_VERSION_CODE`)
- [ ] Create `local.properties` (`sdk.dir=$ANDROID_SDK_ROOT`)
- [ ] Create `google-services.json` from base64 secret
- [ ] Verify `google-services.json` exists
- [ ] Create Android keystore from base64 secret
- [ ] Verify Android keystore exists
- [ ] Install Android SDK components (platforms, build-tools, NDK)
- [ ] Verify NDK `source.properties`
- [ ] Make Gradle executable (`chmod +x android/gradlew`)
- [ ] Run security scan (OWASP)
- [ ] Run Android Lint
- [ ] Run unit tests
- [ ] Build AAB App Bundle (`bundleRelease`)
- [ ] Upload AAB artifact (version-tagged, `if-no-files-found: error`)
- [ ] Build APK (`assembleRelease`)
- [ ] Upload APK artifact (version-tagged, `if-no-files-found: error`)
- [ ] Generate job summary

### Shared CI Components
- [x] CodeQL security scanning workflow (standalone `codeql.yml`)
- [x] CodeQL SAST job integrated into `android-ci.yml` (Job 4 — gates build)
- [x] CodeQL SAST job integrated into `ios-ci.yml` (Job 4 — gates build)
- [x] Dependabot weekly updates (`dependabot.yml` — npm, GitHub Actions, Gradle)
- [ ] Notification setup (Slack/Teams webhooks)
- [ ] Branch protection rules (require CI pass)
- [ ] Documentation & README update

---

## 📝 Notes

1. **Shared Codebase:**
   - Both iOS and Android are **React Native 0.74.1** — same `package.json`, same `npm install`, same `src/` code
   - The `ios/` and `android/` folders contain auto-generated native shells, not separate native apps
   - Application logic lives in `src/` (components, hooks, redux, services, navigators, scenes)

2. **Runner Selection:**
   - iOS **must** use `macos-latest` (requires Xcode)
   - Android **can** use `ubuntu-latest` (cheaper) or `macos-latest`

3. **Build Outputs Per Environment:**
   - SIT → Debug builds for internal testing
   - Staging → Release builds for UAT
   - Production → Release builds for store submission

4. **Export Options (iOS):**
   - SIT → `ExportOptions-Development.plist`
   - Staging → `ExportOptions-AdHoc.plist`
   - Production → `ExportOptions-AppStore.plist`

5. **Build Variants (Android):**
   - SIT → `debug` variant
   - Staging → `release` variant (staging config)
   - Production → `release` variant (production config)

6. **iOS Build Scripts:**
   - Builds are triggered via npm scripts (e.g., `npm run build:ios:release:staging:appstore`) rather than raw `xcodebuild` commands
   - Two artifacts are uploaded per build: `.xcarchive.zip` (for crash symbolication) and `.ipa` (installable binary)

7. **Android Environment Setup:**
   - `local.properties` must be created at CI time (`sdk.dir=$ANDROID_SDK_ROOT`)
   - `google-services.json` (Firebase) is decoded from a base64 secret at CI time — never committed to the repo
   - Signing keystore is decoded from a base64 secret and verified before build
   - Android SDK platforms, build-tools, and NDK must be explicitly installed via `sdkmanager`

8. **Artifact Naming:**
   - All artifacts are tagged with **environment** (SIT / Staging / Production) and **version** (from app config)
   - `if-no-files-found: error` ensures pipeline fails if build output is missing

9. **GitHub Artifacts:**
   - iOS: Upload `.xcarchive.zip` + `.ipa` via `actions/upload-artifact@v3`
   - Android: Upload `.aab` + `.apk` via `actions/upload-artifact@v3`
