const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // provide a stub for PushNotificationIOS which isn't available on web
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'react-native/Libraries/PushNotificationIOS/PushNotificationIOS': require.resolve('./push-notification-ios-stub.js'),
    'expo-text-recognition': require.resolve('./text-recognition-stub.js'),
  };

  return config;
})();
