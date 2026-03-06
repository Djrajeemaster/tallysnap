# Android Studio Setup for TallySnap

## Step 1: Download Android Studio

**Download**: https://developer.android.com/studio

Click "Download Android Studio" (free, ~1GB download)

---

## Step 2: Install Android Studio

1. Run the installer
2. Choose "Standard" installation
3. Accept licenses
4. Wait for installation (~5-10 minutes)
5. **Important**: Let it download Android SDK components

---

## Step 3: Set Environment Variables

### Option A: Using Command Prompt (Recommended)

Open **Command Prompt as Administrator** and run:

```cmd
setx ANDROID_HOME "C:\Users\hello\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

### Option B: Manual Setup

1. Open **System Properties** → **Environment Variables**
2. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\hello\AppData\Local\Android\Sdk`
3. Edit **Path** variable, add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`

---

## Step 4: Verify Installation

**Close and reopen PowerShell**, then run:

```bash
adb version
```

Should show: `Android Debug Bridge version X.X.X`

---

## Step 5: Create Android Virtual Device (AVD)

1. Open **Android Studio**
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Select **Pixel 5** (or any phone)
5. Select **System Image**: **Tiramisu (API 33)** or **UpsideDownCake (API 34)**
6. Click **Download** (if needed)
7. Click **Finish**

---

## Step 6: Start Emulator

In Android Studio:
1. Click **Device Manager** (phone icon)
2. Click ▶️ next to your device
3. Wait for emulator to boot (~1-2 minutes)

---

## Step 7: Build TallySnap

Open **new PowerShell** in project folder:

```bash
cd d:\scanorg\tallysnap
npx expo prebuild
npx expo run:android
```

First build takes ~5-10 minutes. Subsequent builds are faster (~1-2 minutes).

---

## Troubleshooting

### "adb not found" after setting ANDROID_HOME
- **Restart PowerShell** (environment variables need reload)
- Verify path: `echo $env:ANDROID_HOME`

### "SDK location not found"
- Check if SDK exists: `C:\Users\hello\AppData\Local\Android\Sdk`
- If not, open Android Studio → **Settings** → **Android SDK** → note the path

### "No devices found"
- Start emulator from Android Studio first
- Check: `adb devices` (should show emulator)

### Build fails with Gradle error
- Open Android Studio
- Let it download/update Gradle
- Try build again

### Emulator is slow
- Enable **Hardware Acceleration** in BIOS (Intel VT-x / AMD-V)
- Or use physical device (enable USB debugging)

---

## Using Physical Device (Alternative)

1. Enable **Developer Options** on phone:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging**:
   - **Settings** → **Developer Options** → **USB Debugging**
3. Connect phone via USB
4. Allow USB debugging prompt on phone
5. Run: `adb devices` (should show your device)
6. Run: `npx expo run:android`

---

## Quick Reference

**Start emulator**:
```bash
# From Android Studio Device Manager
# Or command line:
emulator -avd Pixel_5_API_33
```

**Build app**:
```bash
npx expo run:android
```

**Rebuild from scratch**:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## Next Steps After Installation

1. Install Android Studio
2. Set ANDROID_HOME
3. Restart PowerShell
4. Verify: `adb version`
5. Create AVD (emulator)
6. Start emulator
7. Run: `npx expo run:android`

**Estimated time**: 30-45 minutes (including downloads)

---

Let me know when Android Studio is installed and I'll help with the build!
