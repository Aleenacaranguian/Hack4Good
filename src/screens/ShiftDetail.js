import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { recordings } from '../data/mockData';

export default function ShiftDetail({ route, navigation }) {
  const { shift, recipient, caregiver } = route.params;

  const shiftRecordings = recordings.filter(
    recording => recording.shiftId === shift.id
  );

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

  return (
    <View style={styles.container}>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recordings</Text>
        <Text style={styles.recordingCount}>
          {shiftRecordings.length} total
        </Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {shiftRecordings.map((recording, index) => (
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

        {shiftRecordings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recordings for this shift</Text>
          </View>
        )}
      </ScrollView>
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
});
