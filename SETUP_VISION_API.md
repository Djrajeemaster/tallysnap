# Enable Google Cloud Vision API

## Steps to Enable:

1. **In Google Cloud Console** (where you are now):
   - Search for **"Vision AI API"** in the search bar at the top
   - Click on **"Cloud Vision API"** (the first result)
   - Click the **"Enable"** button

2. **If Enable button is not visible:**
   - Go to **APIs & Services** → **Library**
   - Search for **"Vision"**
   - Click on **"Cloud Vision API"**
   - Click **Enable**

3. **Create Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key

4. **Add to .env file:**
   ```
   GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
   ```

Once you've enabled the API and got the key, let me know and I'll implement the integration!
