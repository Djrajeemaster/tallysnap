import { Redirect } from 'expo-router';

export default function Index() {
  // Use the Redirect component to ensure navigation happens after root mounts
  return <Redirect href="(tabs)" />;
}
