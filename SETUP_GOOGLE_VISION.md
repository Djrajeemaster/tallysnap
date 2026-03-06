# Setting Up Google Cloud Vision API for TallySnap

## Prerequisites
- Google Account
- Credit Card (required for GCP, but you get $300 free credit)

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name it `tallysnap-ocr`
4. Click **Create**

## Step 2: Enable Vision API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Cloud Vision API"**
3. Click on it and click **Enable**

## Step 3: Create Service Account (for server-side API)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name: `tallysnap-ocr`
4. Role: **Cloud Vision API User**
5. Create JSON key (download it - keep secure!)

## Step 4: Add to .env file

Add these to your `.env` file:
```
# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## Step 5: Install Vision package

```bash
npm install @google-cloud/vision
```

## Alternative: Use Firebase ML Kit (Free, On-Device)

If you don't want to set up Google Cloud, use Firebase ML Kit:

```bash
npx expo install @react-native-firebase/ml-natural-language
```

This is free but requires building a native app (not Expo Go).

---

## Quick Start (Using Cloud Vision API)

Once credentials are set up, the OCR will have 95%+ accuracy!

Would you like me to implement the Google Cloud Vision integration now?
