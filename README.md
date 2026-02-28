# TallySnap

This is an Expo React Native project bootstrapped with `create-expo-app`.  
The goal is a **multilingual receipt scanner** tailored for Indian users, allowing offline OCR, categorization, and expense tracking.  
*The current implementation provides a basic receipt list and persistence; you can scan or upload a receipt from the Scan tab, edit parsed fields (including a category), and store entries locally. A simple report page summarises spending by category. Further enhancements (backend sync, richer analytics, full multilingual UI, OCR on the web, etc.) are still possible.*

The starter code includes camera and text-recognition libraries to capture and extract text from receipts.
It also uses AsyncStorage for local persistence and `nanoid` to generate unique identifiers; you can install them with `npm install @react-native-async-storage/async-storage nanoid`.

---

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

### Automated checks

This project includes a small unit test suite for the text parser (`npm test`) and an ESLint configuration. A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm run lint` and `npm test` on pushes and pull requests so you can keep the codebase production‑ready.



1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Development build (for iOS camera & OCR)

The stock Expo Go app doesn't include `expo-camera` or `expo-text-recognition`. To test the live scanner on your iPhone you need a custom development client or build:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Create a development build for iOS (requires a Mac or EAS cloud):
   ```bash
   cd tallysnap
   eas build --profile development --platform ios
   ```
   Install the resulting build via TestFlight or directly onto your device.

Alternatively, if you have a Mac with Xcode you can build locally:

```bash
cd tallysnap
npx expo prebuild
npx expo run:ios --device
```

Once the dev client is installed, open it and scan the QR code from `npx expo start`; the camera view and OCR will function normally.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
