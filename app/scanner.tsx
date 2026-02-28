import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// no static import of expo-text-recognition – dynamic load in handler
import { useRouter } from 'expo-router';
import { useReceipts } from '@/hooks/use-receipts';
import { parseReceiptText } from '@/models/receipt';

const isWeb = Platform.OS === 'web';

export default function Scanner() {
  // debug: log component types at mount
  useEffect(() => {
    console.log('Component types', {
      ViewType: typeof View,
      TextType: typeof Text,
      ButtonType: typeof Button,
      ActivityIndicatorType: typeof ActivityIndicator,
      CameraType: typeof Camera,
    });
  }, []);

  function makeSafe(Comp: any, name: string) {
    if (typeof Comp === 'function' || typeof Comp === 'string') return Comp;
    console.warn(name + ' is not a valid component:', Comp);
    const Fallback = () => <Text>{name} unavailable</Text>;
    // mark fallback for detection
    (Fallback as any).isFallback = true;
    return Fallback;
  }

  const SafeButton = makeSafe(Button, 'Button');
  const SafeCamera = makeSafe(Camera, 'Camera');
  const SafeActivityIndicator = makeSafe(ActivityIndicator, 'ActivityIndicator');

  const cameraValid = !(SafeCamera as any).isFallback;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const router = useRouter();
  const { addReceipt } = useReceipts();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (Platform.OS !== 'web') {
        const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libStatus !== 'granted') {
          Alert.alert('Permission required', 'Permission to access media library is needed to upload receipts.');
        }
      }
    })();
  }, []);

  const snapAndRecognize = async () => {
    if (cameraRef) {
      setProcessing(true);
      try {
        const photo = await cameraRef.takePictureAsync({ base64: false });
        await handleImageUri(photo.uri);
      } catch (e) {
        Alert.alert('Error', 'Failed to process image');
      } finally {
        setProcessing(false);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      setProcessing(true);
      try {
        await handleImageUri(result.assets[0].uri);
      } catch (e) {
        Alert.alert('Error', 'Failed to process image');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleImageUri = async (uri: string) => {
    let text = '';

    // web branch: use tesseract.js and finish
    if (isWeb) {
      try {
        const Tesseract = await import('tesseract.js');
        const res = await Tesseract.recognize(uri, 'eng');
        text = res.data.text;
      } catch (e) {
        console.warn('web OCR failed', e);
        text = '';
      }
      setRecognizedText(text);
      const summary = parseReceiptText(text);
      const newReceipt = await addReceipt({
        ...summary,
        rawText: text,
        imageUri: uri,
      });
      router.push(`/receipts/${newReceipt.id}`);
      return;
    }

    // native but camera module missing (Expo Go, etc.)
    if (!cameraValid) {
      setRecognizedText('');
      const summary = { rawText: text, imageUri: uri };
      const newReceipt = await addReceipt(summary);
      router.push(`/receipts/${newReceipt.id}`);
      return;
    }

    // native with camera: use expo-text-recognition
    try {
      let TR: any;
      try {
        TR = await import('expo-text-recognition');
      } catch (impErr) {
        console.warn('dynamic import failed, using stub', impErr);
        TR = require('../text-recognition-stub.js');
      }
      if (!TR || typeof TR.recognizeText !== 'function') {
        Alert.alert('Unavailable', 'Text recognition module not available. Use a dev client or build.');
        return;
      }
      const res = await TR.recognizeText(uri);
      text = res.lines.map(l => l.text).join('\n');
      setRecognizedText(text);

      // try to parse and save a receipt
      const summary = parseReceiptText(text);
      const newReceipt = await addReceipt({
        ...summary,
        rawText: text,
        imageUri: uri,
      });
      // navigate to detail view for review/edit
      router.push(`/receipts/${newReceipt.id}`);
    } catch (e) {
      console.warn('OCR error', e);
      Alert.alert('Error', 'Text recognition unavailable.');
    }
  };
    try {
      let TR: any;
      try {
        TR = await import('expo-text-recognition');
      } catch (impErr) {
        console.warn('dynamic import failed, using stub', impErr);
        TR = require('../text-recognition-stub.js');
      }
      if (!TR || typeof TR.recognizeText !== 'function') {
        Alert.alert('Unavailable', 'Text recognition module not available. Use a dev client or build.');
        return;
      }
      const res = await TR.recognizeText(uri);
      const text = res.lines.map(l => l.text).join('\n');
      setRecognizedText(text);

      // try to parse and save a receipt
      const summary = parseReceiptText(text);
      const newReceipt = await addReceipt({
        ...summary,
        rawText: text,
        imageUri: uri,
      });
      // navigate to detail view for review/edit
      router.push(`/receipts/${newReceipt.id}`);
    } catch (e) {
      console.warn('OCR error', e);
      Alert.alert('Error', 'Text recognition unavailable.');
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  // camera component missing (e.g. Expo Go lacks native module)
  if (!cameraValid && !isWeb) {
    return (
      <View style={styles.container}>
        <Text>Camera module unavailable. run in a development build or install a custom client.</Text>
        <View style={styles.buttonContainer}>
          <SafeButton title="Upload from Gallery" onPress={pickImage} disabled={processing} />
        </View>
        {processing && <SafeActivityIndicator size="large" color="#0000ff" />}
        {recognizedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Extracted Text:</Text>
            <Text>{recognizedText}</Text>
          </View>
        ) : null}
        <SafeButton title="Back" onPress={() => router.back()} />
      </View>
    );
  }
  if (!isWeb && hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required to scan receipts.</Text>
        <SafeButton title="Grant Permission" onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
          if (status !== 'granted') {
            Alert.alert('Permission denied', 'Camera access was not granted. Please open Settings and enable the permission.');
          }
        }} />
        <SafeButton title="Open Settings" onPress={() => {
          Alert.alert(
            'Permission needed',
            'Please open your device settings and enable camera access for this app.',
            [{ text: 'OK', style: 'default' }]
          );
        }} />
      </View>
    );
  }

  // On web we don't render camera at all, only allow upload
  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <SafeButton title="Upload from Gallery" onPress={pickImage} disabled={processing} />
        </View>
        {processing && <SafeActivityIndicator size="large" color="#0000ff" />}
        {recognizedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Extracted Text:</Text>
            <Text>{recognizedText}</Text>
          </View>
        ) : null}
        <SafeButton title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  const cameraType = CameraType?.back || CameraType?.front || undefined;

  return (
    <View style={styles.container}>
      <SafeCamera
        style={styles.camera}
        type={cameraType}
        ref={ref => setCameraRef(ref)}
      >
        <View style={styles.buttonContainer}>
          <SafeButton accessibilityLabel="Capture image" title="Capture" onPress={snapAndRecognize} disabled={processing} />
          <View style={styles.spacer} />
          <SafeButton accessibilityLabel="Upload from gallery" title="Upload from Gallery" onPress={pickImage} disabled={processing} />
        </View>
      </SafeCamera>
      {processing && <SafeActivityIndicator size="large" color="#0000ff" />}
      {recognizedText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Extracted Text:</Text>
          <Text>{recognizedText}</Text>
        </View>
      ) : null}
      <SafeButton title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 4,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    margin: 20,
  },
  spacer: {
    height: 10,
  },
  resultContainer: {
    flex: 2,
    padding: 16,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
});
