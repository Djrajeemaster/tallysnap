import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the tabs screen
  return <Redirect href="/(tabs)" />;
}
