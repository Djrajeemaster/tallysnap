const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// Provide a stub for PushNotificationIOS when building for web
module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native/Libraries/PushNotificationIOS/PushNotificationIOS': require.resolve('./push-notification-ios-stub.js'),
    'expo-text-recognition': require.resolve('./text-recognition-stub.js'),
  };

  return config;
};
