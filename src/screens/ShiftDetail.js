//shift details
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';
import ShiftAIAnalysis from '../components/ShiftAIAnalysis';

export default function ShiftDetail({ route, navigation }) {
  const { shift, recipient, caregiver } = route.params;

  // Recordings state - fetch from backend instead of mock data
  const [shiftRecordings, setShiftRecordings] = useState([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);

  // Shift notes state
  const [shiftNotes, setShiftNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch shift notes and recordings when component mounts
  useEffect(() => {
    fetchShiftNotes();
    fetchRecordings();
  }, []);

  const fetchShiftNotes = async () => {
    try {
      setLoadingNotes(true);
      const fetchedNotes = await api.getShiftNotes(shift.id);
      setShiftNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching shift notes:', error);
      Alert.alert('Error', 'Failed to load shift notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      setLoadingRecordings(true);
      // Fetch the shift data which includes recordings
      const shifts = await api.getShifts(recipient.id);

      // Find the current shift and get its recordings
      const currentShift = shifts.find(s => s.id === shift.id);

      if (currentShift && currentShift.recordings) {
        // Fetch notes for each recording to match the expected format
        const recordingsWithNotes = await Promise.all(
          currentShift.recordings.map(async (recording) => {
            try {
              const notes = await api.getNotes(recording.id);
              return {
                ...recording,
                notes: notes || [],
              };
            } catch (error) {
              console.error(`Error fetching notes for recording ${recording.id}:`, error);
              return {
                ...recording,
                notes: [],
              };
            }
          })
        );
        setShiftRecordings(recordingsWithNotes);
      } else {
        setShiftRecordings([]);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setShiftRecordings([]);
    } finally {
      setLoadingRecordings(false);
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

      const createdNote = await api.addShiftNote(shift.id, noteData);
      setShiftNotes([createdNote, ...shiftNotes]);
      setNewNote('');
      Alert.alert('Success', 'Shift note added successfully');
    } catch (error) {
      console.error('Error adding shift note:', error);
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordingPress = (recording) => {
    navigation.navigate('RecordingDetail', {
      recording,
      shift,
      recipient,
      caregiver,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNoteTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.shiftTitle}>
          Shift {shift.shiftNumber} - Day {shift.day}
        </Text>
        <Text style={styles.recipientName}>{recipient.name}</Text>
        <Text style={styles.dateText}>
          {new Date(shift.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Shift Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shift Notes</Text>
            <Text style={styles.recordingCount}>
              {shiftNotes.length} note{shiftNotes.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.addNoteCard}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note about this shift (e.g., patient mood, activities, concerns)..."
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

          {loadingNotes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : shiftNotes.length > 0 ? (
            <View style={styles.notesList}>
              {shiftNotes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteCaregiverName}>
                      {note.caregiverName || note.caregiver_name}
                    </Text>
                    <Text style={styles.noteTimestamp}>
                      {formatNoteTime(note.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyNotesContainer}>
              <Text style={styles.emptyNotesText}>No shift notes yet</Text>
            </View>
          )}
        </View>

        {/* AI Analysis Section */}
        <View style={styles.aiAnalysisSection}>
          <ShiftAIAnalysis
            shiftId={shift.id}
            careRecipientName={recipient.name}
          />
        </View>

        {/* Recordings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recordings</Text>
          <Text style={styles.recordingCount}>
            {shiftRecordings.length} total
          </Text>
        </View>

        <View style={styles.listContainer}>
        {loadingRecordings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading recordings...</Text>
          </View>
        ) : shiftRecordings.map((recording, index) => (
          <TouchableOpacity
            key={recording.id}
            style={styles.recordingCard}
            onPress={() => handleRecordingPress(recording)}
            activeOpacity={0.7}
          >
            <View style={styles.recordingHeader}>
              <View style={styles.recordingNumber}>
                <Text style={styles.recordingNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.recordingInfo}>
                <Text style={styles.timeText}>
                  {formatTime(recording.timestamp)}
                </Text>
                <Text style={styles.durationText}>
                  Duration: {formatDuration(recording.duration)}
                </Text>
              </View>
              <View style={styles.recordingMeta}>
                {recording.notes.length > 0 && (
                  <View style={styles.notesBadge}>
                    <Text style={styles.notesBadgeText}>
                      {recording.notes.length} note{recording.notes.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {!loadingRecordings && shiftRecordings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recordings for this shift</Text>
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
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  shiftTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipientName: {
    fontSize: 18,
    color: '#4A90E2',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recordingCount: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  recordingCard: {
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
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordingNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  recordingMeta: {
    alignItems: 'flex-end',
  },
  notesBadge: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  notesBadgeText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  scrollContent: {
    flex: 1,
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
    marginBottom: 10,
  },
  addNoteCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
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
    backgroundColor: '#fff',
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
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  notesList: {
    paddingHorizontal: 15,
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
  emptyNotesContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  aiAnalysisSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
});
