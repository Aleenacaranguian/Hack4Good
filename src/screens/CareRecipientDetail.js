import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';
import { Colors, TextStyles, ButtonStyles, ContainerStyles, Shadows, BorderRadius, InputStyles } from '../styles/CommonStyles';

export default function CareRecipientDetail({ route, navigation }) {
  const { recipient, caregiver } = route.params;

  // State management
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add shift modal state
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftDate, setNewShiftDate] = useState('');
  const [newShiftStartTime, setNewShiftStartTime] = useState('');
  const [newShiftEndTime, setNewShiftEndTime] = useState('');
  const [newShiftNotes, setNewShiftNotes] = useState('');
  const [newShiftCaregiverName, setNewShiftCaregiverName] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

      // Mock caregiver data - in production, this would come from backend
      const mockCaregivers = [
        'Sarah Johnson',
        'Michael Chen',
        'Emma Williams',
        'David Rodriguez',
        'Lisa Anderson',
        'James Martinez'
      ];

      // Mock shift activities - in production, this would come from backend
      const mockShiftActivities = [
        'Morning routine completed. Assisted with breakfast (oatmeal and tea). Administered morning medications at 9:00 AM. Went for a 20-minute walk in the garden. Patient in good spirits.',
        'Afternoon shift. Lunch served at 12:30 PM (chicken soup and sandwich). Watched favorite TV show together. Assisted with personal hygiene. Blood pressure: 125/80. Mood: cheerful and talkative.',
        'Evening care. Dinner at 6:00 PM (salmon with vegetables). Evening medications given. Read together for 30 minutes. Prepared for bed. All vitals normal. Patient resting comfortably.',
        'Morning care provided. Breakfast included scrambled eggs and toast. Took medications as scheduled. Physical therapy exercises completed (15 minutes). Patient reports feeling well.',
        'Mid-day shift. Assisted with lunch and hydration. Changed bedding. Social time with other residents. Monitored throughout the shift. No concerns noted.',
        'Night shift beginning. Dinner provided and medications administered. Evening routine completed. Patient settled for the night. Vitals checked and recorded.',
      ];

      // Mock shift times
      const shiftTimes = [
        { start: '08:00', end: '14:00' },
        { start: '14:00', end: '20:00' },
        { start: '20:00', end: '02:00' },
        { start: '06:00', end: '12:00' },
        { start: '12:00', end: '18:00' },
        { start: '18:00', end: '00:00' },
      ];

      // Group data by date and track shift numbers per day
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

        // Calculate shift number for THIS specific day (starts at 1 for each day)
        const shiftNumberForDay = groupedByDate[shiftDate].shifts.length + 1;

        // Create a shift index for mock data variety
        const shiftIndex = (shift.shift_number - 1) % mockCaregivers.length;
        const timeIndex = (shift.shift_number - 1) % shiftTimes.length;
        const activityIndex = (shift.shift_number - 1) % mockShiftActivities.length;

        // Add shift info with mock caregiver data
        groupedByDate[shiftDate].shifts.push({
          id: shift.id, // Include the shift ID from backend
          shiftNumber: shift.shift_number,
          caregiverName: 'Shift ' + shift.shift_number, // Backend doesn't have caregiver name in shift
          time: 'Shift ' + shift.shift_number,
          notes: `Shift ${shift.shift_number} - ${shiftDate}`,
          day: shift.day,
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

  const toggleShiftExpansion = (dayIndex, shiftIndex) => {
    const updatedData = [...dailyData];
    const shift = updatedData[dayIndex].shifts[shiftIndex];
    shift.expanded = !shift.expanded;
    setDailyData(updatedData);
  };

  const handleAddShift = () => {
    if (!newShiftDate || !newShiftStartTime || !newShiftEndTime || !newShiftNotes.trim() || !newShiftCaregiverName.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newShiftStartTime) || !timeRegex.test(newShiftEndTime)) {
      Alert.alert('Invalid Time Format', 'Please enter times in HH:MM format (e.g., 08:00, 14:00)');
      return;
    }

    // Convert times to minutes for comparison
    const [startHour, startMinute] = newShiftStartTime.split(':').map(Number);
    const [endHour, endMinute] = newShiftEndTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Check if end time is before start time
    if (endTimeInMinutes <= startTimeInMinutes) {
      Alert.alert(
        'Invalid Time Range',
        'End time must be after start time. For overnight shifts, please create separate entries for each day.'
      );
      return;
    }

    // Find or create day group
    const updatedData = [...dailyData];
    let dayIndex = updatedData.findIndex(d => d.date === newShiftDate);

    const newShift = {
      id: `shift-${Date.now()}`,
      shiftNumber: 1,
      caregiverName: newShiftCaregiverName,
      startTime: newShiftStartTime,
      endTime: newShiftEndTime,
      time: `${newShiftStartTime} - ${newShiftEndTime}`,
      notes: newShiftNotes,
      expanded: false,
    };

    if (dayIndex >= 0) {
      // Day exists, add shift
      newShift.shiftNumber = updatedData[dayIndex].shifts.length + 1;
      updatedData[dayIndex].shifts.push(newShift);
    } else {
      // Create new day
      updatedData.unshift({
        date: newShiftDate,
        displayDate: formatDisplayDate(newShiftDate),
        shifts: [newShift],
        recordings: [],
      });
    }

    // Sort by date
    updatedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setDailyData(updatedData);

    // Reset form
    setNewShiftDate('');
    setNewShiftStartTime('');
    setNewShiftEndTime('');
    setNewShiftNotes('');
    setNewShiftCaregiverName('');
    setShowAddShiftModal(false);

    Alert.alert('Success', 'Shift added successfully!');
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

  const handleShiftPress = (shift, date) => {
    navigation.navigate('ShiftDetail', {
      shift: {
        id: shift.id || `${recipient.id}-${date}-${shift.shiftNumber}`,
        shift_number: shift.shiftNumber,
        shiftNumber: shift.shiftNumber,
        date: date,
        day: shift.day || 1,
      },
      recipient,
      caregiver,
    });
  };

  const handleViewProfile = () => {
    navigation.navigate('RecipientProfile', { recipient });
  };

  const handleGroupChat = () => {
    navigation.navigate('CaregiverGroupChat', {
      recipient,
      caregiver
    });
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

        {/* Button Container for Profile and Group Chat */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
            <Text style={styles.profileButtonText}>View Full Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.groupChatButton} onPress={handleGroupChat}>
            <Text style={styles.groupChatButtonText}>Group Chat with Caregivers</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity
                  key={shiftIndex}
                  style={styles.shiftBox}
                  onPress={() => toggleShiftExpansion(dayIndex, shiftIndex)}
                  activeOpacity={0.7}
                >
                  {/* Shift Summary - Always Visible */}
                  <View style={styles.shiftSummaryContainer}>
                    <View style={styles.shiftHeader}>
                      <View style={styles.caregiverInfoContainer}>
                        <View style={styles.caregiverAvatar}>
                          <Text style={styles.caregiverAvatarText}>
                            {shift.caregiverName ? shift.caregiverName.split(' ').map(n => n[0]).join('') : 'S' + shift.shiftNumber}
                          </Text>
                        </View>
                        <View style={styles.shiftMainInfo}>
                          <Text style={styles.shiftCaregiver}>
                            {shift.caregiverName || `Shift ${shift.shiftNumber}`}
                          </Text>
                          <Text style={styles.shiftTime}>
                            {shift.time || shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : `Shift ${shift.shiftNumber}`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.shiftBadge}>
                        <Text style={styles.shiftBadgeText}>
                          Shift {shift.shiftNumber}
                        </Text>
                      </View>
                    </View>

                    {/* Expand Indicator */}
                    <Text style={styles.expandIndicator}>
                      {shift.expanded ? '▼ Tap to collapse' : '▶ Tap for details'}
                    </Text>
                  </View>

                  {/* Expanded Notes */}
                  {shift.expanded && (
                    <View style={styles.shiftDetails}>
                      <View style={styles.divider} />
                      <Text style={styles.notesLabel}>Shift Notes:</Text>
                      <Text style={styles.notesText}>
                        {shift.notes || 'No notes available for this shift. Tap "+" to add notes.'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
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

      {/* Add Shift Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setNewShiftDate(getTodayDate());
          setNewShiftCaregiverName(caregiver?.name || '');
          setShowAddShiftModal(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Shift Modal */}
      <Modal
        visible={showAddShiftModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddShiftModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Shift</Text>
              <TouchableOpacity onPress={() => setShowAddShiftModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Caregiver Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter caregiver name"
                placeholderTextColor={Colors.gray400}
                value={newShiftCaregiverName}
                onChangeText={setNewShiftCaregiverName}
              />

              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="2026-01-15"
                placeholderTextColor={Colors.gray400}
                value={newShiftDate}
                onChangeText={setNewShiftDate}
              />

              <Text style={styles.inputLabel}>Start Time (HH:MM)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder=" e.g. 08:00"
                placeholderTextColor={Colors.gray400}
                value={newShiftStartTime}
                onChangeText={setNewShiftStartTime}
              />

              <Text style={styles.inputLabel}>End Time (HH:MM)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 14:00"
                placeholderTextColor={Colors.gray400}
                value={newShiftEndTime}
                onChangeText={setNewShiftEndTime}
              />

              <Text style={styles.inputLabel}>Shift Notes</Text>
              <TextInput
                style={[styles.modalInput, styles.notesInput]}
                placeholder="Describe activities, meals, medications, mood, etc."
                placeholderTextColor={Colors.gray400}
                value={newShiftNotes}
                onChangeText={setNewShiftNotes}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddShift}
              >
                <Text style={styles.submitButtonText}>Add Shift</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...ContainerStyles.screen,
    backgroundColor: Colors.gray50,
  },
  header: {
    ...ContainerStyles.headerRounded,
  },
  recipientName: {
    ...TextStyles.h2,
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
    backgroundColor: Colors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  headerText: {
    fontSize: 14,
    color: Colors.gray700,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  profileButton: {
    ...ButtonStyles.base,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  profileButtonText: {
    ...TextStyles.buttonText,
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
    lineHeight: 20,
  },
  groupChatButton: {
    ...ButtonStyles.base,
    backgroundColor: '#FF9A76',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    ...Shadows.medium,
  },
  groupChatButtonText: {
    ...TextStyles.buttonText,
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    flex: 1,
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  dayBox: {
    ...ContainerStyles.cardLarge,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  dayHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  dayTitle: {
    ...TextStyles.h3,
    marginBottom: 4,
  },
  dayDate: {
    ...TextStyles.small,
    color: Colors.gray600,
  },
  shiftsContainer: {
    marginBottom: 16,
  },
  shiftBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
    position: 'relative',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shiftBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  shiftBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  shiftTime: {
    fontSize: 13,
    color: Colors.gray600,
    fontWeight: '600',
  },
  shiftCaregiver: {
    fontSize: 15,
    color: Colors.gray700,
    fontWeight: '600',
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.gray600,
    fontWeight: '600',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  shiftArrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  shiftArrow: {
    fontSize: 28,
    color: Colors.gray500,
    fontWeight: 'bold',
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
    ...TextStyles.h4,
  },
  recordingBox: {
    backgroundColor: '#fff5e6',
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffe0b2',
    ...Shadows.small,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  recordingIconText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  recordingDuration: {
    fontSize: 14,
    color: Colors.gray600,
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
    color: Colors.info,
    fontWeight: '600',
  },
  recordingArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  noRecordingsBox: {
    backgroundColor: Colors.gray50,
    padding: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
  },
  noRecordingsText: {
    ...TextStyles.small,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  loadingContainer: {
    ...ContainerStyles.centered,
    paddingVertical: 60,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray600,
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
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
    ...ButtonStyles.base,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    ...TextStyles.buttonText,
    fontSize: 15,
  },
  emptyContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.gray500,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  caregiverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  caregiverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  caregiverAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shiftMainInfo: {
    flex: 1,
  },
  shiftSummaryContainer: {
    width: '100%',
  },
  shiftDetails: {
    marginTop: 12,
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginBottom: 12,
  },
  expandIndicator: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '300',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 28,
    color: Colors.gray600,
    fontWeight: '300',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    ...InputStyles.rounded,
    fontSize: 15,
    marginBottom: 8,
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    ...Shadows.medium,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});