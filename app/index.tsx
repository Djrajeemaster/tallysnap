import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    // simply show the tab navigator
    router.replace('(tabs)');
  }, []);
  return null;
}
