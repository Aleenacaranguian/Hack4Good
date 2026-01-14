import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

export default function CareRecipientDetail({ route, navigation }) {
  const { recipient, caregiver } = route.params;

  // State management
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shifts and recordings from backend
  useEffect(() => {
    fetchShiftsAndRecordings();
  }, [recipient.id]);

  const fetchShiftsAndRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch shifts for this care recipient
      const shifts = await api.getShifts(recipient.id);

      // Group data by date
      const groupedByDate = {};

      for (const shift of shifts) {
        const shiftDate = shift.date;

        if (!groupedByDate[shiftDate]) {
          groupedByDate[shiftDate] = {
            date: shiftDate,
            displayDate: formatDisplayDate(shiftDate),
            shifts: [],
            recordings: [],
          };
        }

        // Add shift info (backend doesn't have detailed shift notes yet, so we'll show basic info)
        groupedByDate[shiftDate].shifts.push({
          shiftNumber: shift.shift_number,
          caregiverName: 'Shift ' + shift.shift_number, // Backend doesn't have caregiver name in shift
          time: 'Shift ' + shift.shift_number,
          notes: `Shift ${shift.shift_number} - ${shiftDate}`,
        });

        // Add recordings for this shift and fetch their note counts
        if (shift.recordings && shift.recordings.length > 0) {
          for (const recording of shift.recordings) {
            // Fetch notes for each recording to get the count
            const notes = await api.getNotes(recording.id);

            groupedByDate[shiftDate].recordings.push({
              ...recording,
              notes: notes, // Include the actual notes for count
              uploadedBy: recipient.name,
            });
          }
        }
      }

      // Convert to array and sort by date (most recent first)
      const dailyDataArray = Object.values(groupedByDate).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setDailyData(dailyDataArray);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please check if the backend server is running.');
      Alert.alert('Error', 'Failed to load care recipient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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

  const handleRecordingPress = (recording, day) => {
    const shift = day.shifts[0]; // You can implement logic to match recording to specific shift
    navigation.navigate('RecordingDetail', {
      recording,
      shift,
      recipient,
      caregiver,
    });
  };

  const handleViewProfile = () => {
    navigation.navigate('RecipientProfile', { recipient });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.recipientName}>{recipient.name}</Text>
        <View style={styles.headerDetails}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerText}>Age: {recipient.age}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerText}>Room: {recipient.room}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
          <Text style={styles.profileButtonText}>View Full Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Data */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="red" />
            <Text style={styles.loadingText}>Loading care recipient data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchShiftsAndRecordings}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : dailyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available for this care recipient</Text>
          </View>
        ) : (
          dailyData.map((day, dayIndex) => (
          <View key={day.date} style={styles.dayBox}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day.displayDate}</Text>
              <Text style={styles.dayDate}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
            </View>

            {/* Shifts */}
            <View style={styles.shiftsContainer}>
              {day.shifts.map((shift, shiftIndex) => (
                <View key={shiftIndex} style={styles.shiftBox}>
                  <View style={styles.shiftHeader}>
                    <View style={styles.shiftBadge}>
                      <Text style={styles.shiftBadgeText}>Shift {shift.shiftNumber}</Text>
                    </View>
                    <Text style={styles.shiftTime}>{shift.time}</Text>
                  </View>
                  <Text style={styles.shiftCaregiver}> {shift.caregiverName}</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{shift.notes}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recordings */}
            {day.recordings.length > 0 && (
              <View style={styles.recordingsContainer}>
                <View style={styles.recordingsHeader}>
                  <Text style={styles.recordingsIcon}>🎙️</Text>
                  <Text style={styles.recordingsTitle}>Recordings ({day.recordings.length})</Text>
                </View>
                
                {day.recordings.map((recording, recordingIndex) => (
                  <TouchableOpacity
                    key={recording.id}
                    style={styles.recordingBox}
                    onPress={() => handleRecordingPress(recording, day)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recordingContent}>
                      <View style={styles.recordingIcon}>
                        <Text style={styles.recordingIconText}>▶</Text>
                      </View>
                      <View style={styles.recordingInfo}>
                        <Text style={styles.recordingTime}>{formatTime(recording.timestamp)}</Text>
                        <Text style={styles.recordingDuration}>{formatDuration(recording.duration)}</Text>
                        {recording.notes.length > 0 && (
                          <View style={styles.notesBadge}>
                            <Text style={styles.notesBadgeText}>💬 {recording.notes.length} note{recording.notes.length > 1 ? 's' : ''}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.recordingArrow}>
                        <Text style={styles.arrow}>›</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {day.recordings.length === 0 && (
              <View style={styles.noRecordingsBox}>
                <Text style={styles.noRecordingsText}>No recordings for this day</Text>
              </View>
            )}
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  headerDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  headerText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  profileButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  dayBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dayHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'red',
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  shiftsContainer: {
    marginBottom: 16,
  },
  shiftBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shiftBadge: {
    backgroundColor: 'red',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shiftBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  shiftTime: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
  },
  shiftCaregiver: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'red',
  },
  notesLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  recordingsContainer: {
    marginTop: 4,
  },
  recordingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recordingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  recordingBox: {
    backgroundColor: '#fff5e6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffe0b2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  recordingIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  notesBadge: {
    marginTop: 6,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  notesBadgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  recordingArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  noRecordingsBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  noRecordingsText: {
    fontSize: 14,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    fontSize: 15,
    color: '#c00',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});