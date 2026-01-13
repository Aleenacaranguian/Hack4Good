import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

export default function RecordingDetail({ route }) {
  const { recording, shift, recipient, caregiver } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch notes from API when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await api.getNotes(recording.id);
      setNotes(fetchedNotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes. Please check if the backend server is running.');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    // Simulate play/pause - actual audio playback would be implemented here
    setIsPlaying(!isPlaying);

    if (!isPlaying) {
      // Simulate playback
      Alert.alert('Playing', 'Audio playback would start here');
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() === '') {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      const noteData = {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
        content: newNote.trim(),
      };

      const createdNote = await api.addNote(recording.id, noteData);
      setNotes([...notes, createdNote]);
      setNewNote('');
      Alert.alert('Success', 'Note added successfully and synced with server');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note. Please check if the backend server is running.');
      console.error('Error adding note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.recipientName}>{recipient.name}</Text>
          <Text style={styles.recordingInfo}>
            Shift {shift.shiftNumber} - Day {shift.day}
          </Text>
          <Text style={styles.timestamp}>
            {formatTime(recording.timestamp)}
          </Text>
        </View>

        <View style={styles.playerSection}>
          <View style={styles.playerCard}>
            <Text style={styles.durationText}>
              {formatDuration(recording.duration)}
            </Text>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.7}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <View style={styles.waveform}>
              {isPlaying ? (
                <Text style={styles.playingText}>Playing...</Text>
              ) : (
                <Text style={styles.playingText}>Tap to play recording</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <View style={styles.addNoteCard}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a new note for other caregivers..."
              value={newNote}
              onChangeText={setNewNote}
              multiline
              numberOfLines={3}
              editable={!submitting}
            />
            <TouchableOpacity
              style={[styles.addNoteButton, submitting && styles.addNoteButtonDisabled]}
              onPress={handleAddNote}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.addNoteButtonText}>Add Note</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
          ) : notes.length > 0 ? (
            <View style={styles.notesList}>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteCaregiverName}>
                      {note.caregiverName || note.caregiver_name}
                    </Text>
                    <Text style={styles.noteTimestamp}>
                      {formatTime(note.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyNotes}>
              <Text style={styles.emptyNotesText}>
                No notes yet. Be the first to add one!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recipientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recordingInfo: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  playerSection: {
    padding: 15,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonText: {
    fontSize: 36,
    color: 'white',
  },
  waveform: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  playingText: {
    fontSize: 14,
    color: '#666',
  },
  notesSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addNoteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addNoteButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNoteButtonDisabled: {
    backgroundColor: '#93B8E0',
    opacity: 0.7,
  },
  addNoteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  notesList: {
    marginTop: 10,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  noteCaregiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  noteContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emptyNotes: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyNotesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});