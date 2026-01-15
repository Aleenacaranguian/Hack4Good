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
import { Colors, TextStyles, ButtonStyles, ContainerStyles, InputStyles, Shadows, BorderRadius } from '../styles/CommonStyles';

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
    ...ContainerStyles.screen,
    backgroundColor: Colors.gray100,
  },
  header: {
    ...ContainerStyles.header,
  },
  shiftTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  recipientName: {
    ...TextStyles.h4,
    color: Colors.info,
    marginBottom: 5,
  },
  dateText: {
    ...TextStyles.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...TextStyles.h4,
  },
  recordingCount: {
    ...TextStyles.small,
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  recordingCard: {
    ...ContainerStyles.card,
    padding: 15,
    marginBottom: 12,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recordingNumberText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingInfo: {
    flex: 1,
  },
  timeText: {
    ...TextStyles.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationText: {
    ...TextStyles.small,
  },
  recordingMeta: {
    alignItems: 'flex-end',
  },
  notesBadge: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: 5,
  },
  notesBadgeText: {
    color: Colors.info,
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: Colors.gray400,
  },
  emptyState: {
    ...ContainerStyles.centered,
    paddingTop: 60,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.textLight,
  },
  scrollContent: {
    flex: 1,
  },
  notesSection: {
    backgroundColor: Colors.gray50,
    paddingBottom: 20,
    marginBottom: 10,
  },
  addNoteCard: {
    ...ContainerStyles.card,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
  },
  noteInput: {
    ...InputStyles.base,
    ...InputStyles.multiline,
    minHeight: 80,
    marginBottom: 12,
  },
  addNoteButton: {
    ...ButtonStyles.base,
    ...ButtonStyles.info,
  },
  addNoteButtonDisabled: {
    ...ButtonStyles.disabled,
  },
  addNoteButtonText: {
    ...TextStyles.buttonText,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    ...TextStyles.small,
    marginTop: 10,
  },
  notesList: {
    paddingHorizontal: 15,
  },
  noteCard: {
    ...ContainerStyles.card,
    padding: 15,
    marginBottom: 12,
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
    ...TextStyles.body,
    fontWeight: 'bold',
    color: Colors.info,
  },
  noteTimestamp: {
    ...TextStyles.caption,
  },
  noteContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  emptyNotesContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: BorderRadius.md,
    padding: 30,
    alignItems: 'center',
  },
  emptyNotesText: {
    ...TextStyles.small,
    textAlign: 'center',
  },
});
