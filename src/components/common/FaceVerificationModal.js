import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
let FaceDetector;
try {
  FaceDetector = require('expo-face-detector');
} catch (e) {
  FaceDetector = null;
}
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = width;
const CAMERA_SIZE = SCREEN_WIDTH * 0.75;

const FaceVerificationModal = ({ visible, onClose, onCapture, title = 'Face Verification' }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [visible]);

  const onFacesDetected = ({ faces }) => {
    if (faces.length > 0 && !isProcessing) {
      setFaceData(faces[0]);
    } else {
      setFaceData(null);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        scale: 0.5,
      });
      
      onCapture(photo.base64);
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <Modal visible={visible}><View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View></Modal>;
  }
  if (hasPermission === false) {
    return (
      <Modal visible={visible}>
        <View style={styles.center}>
          <Text>No access to camera</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onFacesDetected={FaceDetector ? onFacesDetected : undefined}
            faceDetectorSettings={FaceDetector ? {
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 100,
              tracking: true,
            } : undefined}
          />
          <View style={styles.overlay}>
              <View style={[
                styles.faceRect, 
                faceData ? styles.faceDetected : styles.faceNotDetected
              ]} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {!FaceDetector 
              ? 'Manual Mode: Position your face and tap Verify'
              : faceData 
                ? 'Face detected! Hold still and tap verify.' 
                : 'Position your face within the circle'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.captureBtn, (!FaceDetector ? false : !faceData || isProcessing) && styles.disabledBtn]} 
            onPress={handleCapture}
            disabled={(!FaceDetector ? false : !faceData) || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.captureBtnText}>Verify Identity</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  closeIcon: { padding: 4 },
  cameraFrame: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    borderWidth: 4,
    borderColor: colors.border,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  faceRect: {
    width: CAMERA_SIZE * 0.8,
    height: CAMERA_SIZE * 0.8,
    borderRadius: (CAMERA_SIZE * 0.8) / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  faceDetected: { borderColor: colors.success, backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  faceNotDetected: { borderColor: 'rgba(255,255,255,0.3)' },
  footer: {
    padding: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  captureBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: { backgroundColor: colors.textTertiary, shadowOpacity: 0 },
  captureBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { marginTop: 20, padding: 12, backgroundColor: colors.primary, borderRadius: 8 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default FaceVerificationModal;
