import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';

export default function CareRecipientHome({ route, navigation }) {
  const { user } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Mock caregiver list - replace with actual data from your backend
  const [caregivers] = useState([
    { id: 'CG001', name: 'Sarah Johnson' },
    { id: 'CG002', name: 'Michael Chen' },
    { id: 'CG003', name: 'Emily Rodriguez' },
    { id: 'CG004', name: 'David Kim' },
  ]);
  const [excludedCaregivers, setExcludedCaregivers] = useState([]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clean up any active recordings or playback
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
            if (recording) {
              await recording.stopAndUnloadAsync();
              setRecording(null);
            }
            
            // Clear any intervals
            if (recording?._interval) {
              clearInterval(recording._interval);
            }
            
            // Here you would also clear any authentication tokens, user session, etc.
            // For example:
            // await AsyncStorage.removeItem('userToken');
            // await AsyncStorage.removeItem('userData');
            
            // Navigate back to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], // Replace 'Login' with your actual login screen name
            });
          },
        },
      ]
    );
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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
        setHasRecording(false);
        setRecordingDuration(0);
        startPulse();

        // Track recording duration
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        recording._interval = interval;
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

      // Clear interval
      if (recording._interval) {
        clearInterval(recording._interval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setHasRecording(true);
      setRecording(null);

      Alert.alert('Recording Saved', 'Review your recording below.');
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleRecordButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayback = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error('Failed to play recording', err);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const handleUpload = () => {
    if (excludedCaregivers.length > 0) {
      const excluded = caregivers
        .filter(c => excludedCaregivers.includes(c.id))
        .map(c => c.name)
        .join(', ');

      Alert.alert(
        'Upload Recording',
        `Recording will be visible to all caregivers except: ${excluded}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: async () => {
              // Here you would upload to cloud storage with privacy settings
              // Include excludedCaregivers array in the upload
              Alert.alert('Success', 'Recording uploaded successfully!');
              
              // Clean up
              if (sound) {
                await sound.unloadAsync();
                setSound(null);
              }
              setHasRecording(false);
              setRecordingUri(null);
              setRecordingDuration(0);
              setExcludedCaregivers([]);
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Upload Recording',
        'Recording will be visible to all caregivers',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: async () => {
              // Upload logic here
              Alert.alert('Success', 'Recording uploaded successfully!');
              
              if (sound) {
                await sound.unloadAsync();
                setSound(null);
              }
              setHasRecording(false);
              setRecordingUri(null);
              setRecordingDuration(0);
            }
          },
        ]
      );
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
            setHasRecording(false);
            setRecordingUri(null);
            setRecordingDuration(0);
            setExcludedCaregivers([]);
            Alert.alert('Deleted', 'Recording has been deleted');
          }
        },
      ]
    );
  };

  const handleRecordAgain = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setHasRecording(false);
    setRecordingUri(null);
    setRecordingDuration(0);
    setExcludedCaregivers([]);
    startRecording();
  };

  const toggleCaregiverExclusion = (caregiverId) => {
    if (excludedCaregivers.includes(caregiverId)) {
      setExcludedCaregivers(excludedCaregivers.filter(id => id !== caregiverId));
    } else {
      setExcludedCaregivers([...excludedCaregivers, caregiverId]);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.WelcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user.name}</Text>
              {!hasRecording && !isRecording && (
                <Text style={styles.instructionText}>Tap to record a voice message</Text>
              )}
              {isRecording && (
                <Text style={styles.instructionText}>Recording... Tap to stop</Text>
              )}
              {hasRecording && (
                <Text style={styles.instructionText}>Review your recording</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recording Duration Display */}
        {(isRecording || hasRecording) && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}

        {/* Main Record/Stop Button */}
        {!hasRecording && (
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleRecordButton}
            >
              <Animated.View
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordingActive,
                  { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
                ]}
              >
                <View
                  style={[
                    styles.recordIcon,
                    isRecording && styles.recordIconStop,
                  ]}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {/* Playback Section */}
        {hasRecording && (
          <View style={styles.playbackSection}>
            <View style={styles.playbackCard}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayback}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.playbackText}>
                {isPlaying ? 'Playing...' : 'Tap to play'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.uploadButton]}
                onPress={handleUpload}
              >
                <Text style={styles.actionButtonText}>📤 Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.recordAgainButton]}
                onPress={handleRecordAgain}
              >
                <Text style={styles.actionButtonText}>🔄 Record Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>

              {/* Privacy Settings */}
              <TouchableOpacity
                style={styles.privacyButton}
                onPress={() => setShowPrivacyModal(true)}
              >
                <Text style={styles.privacyButtonText}>🔒 Privacy Settings</Text>
                <Text style={styles.privacySubtext}>
                  {excludedCaregivers.length === 0
                    ? 'Visible to all caregivers'
                    : `Hidden from ${excludedCaregivers.length} caregiver(s)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Settings</Text>
            <Text style={styles.modalSubtitle}>
              Select caregivers to exclude from viewing this recording
            </Text>

            <ScrollView style={styles.caregiverList}>
              {caregivers.map((caregiver) => {
                const isExcluded = excludedCaregivers.includes(caregiver.id);
                return (
                  <TouchableOpacity
                    key={caregiver.id}
                    style={[
                      styles.caregiverItem,
                      isExcluded && styles.caregiverItemExcluded,
                    ]}
                    onPress={() => toggleCaregiverExclusion(caregiver.id)}
                  >
                    <Text
                      style={[
                        styles.caregiverName,
                        isExcluded && styles.caregiverNameExcluded,
                      ]}
                    >
                      {caregiver.name}
                    </Text>
                    <Text
                      style={[
                        styles.caregiverStatus,
                        { color: isExcluded ? '#f44336' : '#4CAF50' },
                      ]}
                    >
                      {isExcluded ? '❌ Hidden' : '✅ Visible'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  WelcomeText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  durationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  recordButton: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: '#f44336',
  },
  recordIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  recordIconStop: {
    borderRadius: 8,
  },
  playbackSection: {
    padding: 20,
  },
  playbackCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonText: {
    fontSize: 36,
    color: 'white',
  },
  playbackText: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  recordAgainButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  privacyButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  privacyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 4,
  },
  privacySubtext: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  caregiverList: {
    maxHeight: 400,
  },
  caregiverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  caregiverItemExcluded: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  caregiverNameExcluded: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  caregiverStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});