import { useReceipts } from '@/hooks/use-receipts';
import { parseReceiptText } from '@/models/receipt';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Dynamic import for camera (not available in Expo Go)
let CameraModule: any = null;
let CameraTypeModule: any = null;

const isWeb = Platform.OS === 'web';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [CameraComponent, setCameraComponent] = useState<any>(null);
  const router = useRouter();
  const { addReceipt } = useReceipts();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (Platform.OS !== 'web') {
        const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Permission to access media library is needed to upload receipts.'
          );
        }
      }
      
      // Try to load camera module
      if (!isWeb) {
        try {
          const cameraModule = await import('expo-camera');
          CameraModule = cameraModule.Camera;
          setCameraComponent(() => CameraModule);
        } catch {
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
        Alert.alert('Error', 'Failed to capture image');
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

    if (!result.canceled && result.assets?.[0]) {
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
    try {
      const { recognizeText } = await import('@/services/ocr');
      const result = await recognizeText(uri);
      const text = result.text;
      
      setRecognizedText(text);
      const summary = parseReceiptText(text);
      
      const newReceipt = await addReceipt({
        ...summary,
        rawText: text,
        imageUri: uri,
      });
      
      console.log('Receipt created:', newReceipt.id);
      router.push(`/receipts/${newReceipt.id}`);
    } catch (error) {
      console.error('OCR failed:', error);
      Alert.alert('OCR Error', 'Failed to extract text from image. Please try again.');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan receipts, we need access to your camera.
          </Text>
          <Button
            title="Grant Permission"
            onPress={async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
            color="#007AFF"
          />
        </View>
        <TouchableOpacity style={styles.alternativeButton} onPress={pickImage}>
          <Text style={styles.alternativeButtonText}>
            Or upload from gallery
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.webCard}>
          <Text style={styles.webIcon}>🖼️</Text>
          <Text style={styles.webTitle}>Scan Receipt</Text>
          <Text style={styles.webSubtitle}>
            Upload an image of your receipt to extract information
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!CameraComponent) {
    return (
      <View style={styles.container}>
        <View style={styles.webCard}>
          <Text style={styles.webIcon}>📷</Text>
          <Text style={styles.webTitle}>Camera Unavailable</Text>
          <Text style={styles.webSubtitle}>
            Camera module is not available. Please use a development build or upload from gallery.
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const Camera = CameraModule;

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraTypeModule?.back}
        ref={(ref: any) => setCameraRef(ref)}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
          </View>
          <Text style={styles.hint}>Align receipt within the frame</Text>
        </View>
      </Camera>

      <View style={styles.controls}>
        {processing ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={snapAndRecognize}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={pickImage}
          disabled={processing}
        >
          <Text style={styles.galleryButtonText}>📁 Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 280,
    height: 380,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#007AFF',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  scanCornerTopRight: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    left: undefined,
    right: 0,
  },
  scanCornerBottomLeft: {
    borderTopWidth: 0,
    borderBottomWidth: 3,
    top: undefined,
    bottom: 0,
  },
  scanCornerBottomRight: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    top: undefined,
    bottom: 0,
    left: undefined,
    right: 0,
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  galleryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  alternativeButton: {
    marginTop: 20,
    padding: 16,
  },
  alternativeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  webCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  webIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
