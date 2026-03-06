# Building TallySnap App

## OCR Methods (Priority Order)
1. **Native ML Kit** (Android/iOS) - Best accuracy, offline, free
2. **OCR.space API** (All platforms) - Good accuracy, online, 25k/month free
3. **Tesseract.js** (Web fallback) - Lower accuracy, offline

---

## Prerequisites

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS**:
   ```bash
   eas build:configure
   ```

---

## Build for Android

### Development Build (for testing):
```bash
eas build --profile development --platform android
```

### Production Build (APK):
```bash
eas build --profile preview --platform android
```

### Production Build (AAB for Play Store):
```bash
eas build --profile production --platform android
```

**Install APK**: Download from EAS dashboard and install on device

---

## Build for iOS

### Development Build:
```bash
eas build --profile development --platform ios
```

### Production Build (for TestFlight/App Store):
```bash
eas build --profile production --platform ios
```

**Requirements**:
- Apple Developer account ($99/year)
- Mac with Xcode (for local builds)

---

## Local Development Build (Faster)

### Android (requires Android Studio):
```bash
npx expo prebuild
npx expo run:android
```

### iOS (requires Mac + Xcode):
```bash
npx expo prebuild
npx expo run:ios
```

---

## Testing the Build

1. **Install the app** on your device
2. **Grant camera permissions**
3. **Test OCR**:
   - Take photo of receipt
   - Upload from gallery
   - Check if ML Kit is used (console: "✓ ML Kit succeeded")

---

## Environment Variables for Build

Update `app.json` or use EAS Secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_OCR_SPACE_API_KEY --value your_key_here
```

---

## Build Profiles (eas.json)

Already configured:
- **development**: For testing with Expo Go alternative
- **preview**: APK for sharing/testing
- **production**: For app stores

---

## Troubleshooting

### "expo-text-recognition not found"
- Run: `npx expo install expo-text-recognition`
- Rebuild: `eas build --profile development --platform android`

### Build fails
- Check `eas.json` configuration
- Verify all dependencies in `package.json`
- Check EAS build logs

### ML Kit not working
- Ensure development build (not Expo Go)
- Check device permissions
- Falls back to OCR.space automatically

---

## Next Steps After Build

1. Test on real devices
2. Submit to Play Store / App Store
3. Monitor OCR accuracy
4. Collect user feedback
