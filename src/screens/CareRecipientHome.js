import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';

export default function CareRecipientHome({ route }) {
  const { user } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
        setIsRecording(true);
        startPulse();
      } else {
        Alert.alert('Permission Denied', 'Microphone permission is required to record audio.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      stopPulse();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Here you would upload to cloud storage
      Alert.alert(
        'Recording Saved',
        'Your voice message has been recorded successfully!',
        [{ text: 'OK' }]
      );

      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
        <Text style={styles.instructionText}>
          {isRecording
            ? 'Recording... Tap again to stop'
            : 'Tap the button below to record a voice message'}
        </Text>
      </View>

      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.recordButtonInner,
              isRecording && styles.recordingActive,
              { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
            ]}
          >
            <Text style={styles.recordIcon}>{isRecording ? '■' : '●'}</Text>
          </Animated.View>
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording in progress...</Text>
          </View>
        )}
      </View>

      {isRecording && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <View style={styles.recordingDotLarge} />
            <Text style={styles.overlayText}>Recording your message</Text>
            <Text style={styles.overlaySubtext}>Speak clearly into your device</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: '#E74C3C',
  },
  recordIcon: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E74C3C',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  recordingDotLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    marginBottom: 20,
  },
  overlayText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overlaySubtext: {
    fontSize: 16,
    color: '#ccc',
  },
});
