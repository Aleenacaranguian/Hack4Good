import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { shifts } from '../data/mockData';

export default function CareRecipientDetail({ route, navigation }) {
  const { recipient, caregiver } = route.params;

  const recipientShifts = shifts.filter(
    shift => shift.careRecipientId === recipient.id
  );

  const handleShiftPress = (shift) => {
    navigation.navigate('ShiftDetail', { shift, recipient, caregiver });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {recipient.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.recipientName}>{recipient.name}</Text>
          <Text style={styles.recipientDetails}>
            Age: {recipient.age} • Room: {recipient.room}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Work Shifts</Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {recipientShifts.map((shift) => (
          <TouchableOpacity
            key={shift.id}
            style={styles.shiftCard}
            onPress={() => handleShiftPress(shift)}
            activeOpacity={0.7}
          >
            <View style={styles.shiftHeader}>
              <View style={styles.shiftBadge}>
                <Text style={styles.shiftBadgeText}>
                  Shift {shift.shiftNumber}
                </Text>
              </View>
              <Text style={styles.dayText}>Day {shift.day}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(shift.date)}</Text>
            <View style={styles.shiftFooter}>
              <Text style={styles.recordingCount}>
                {shift.recordings.length} recording{shift.recordings.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {recipientShifts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No shifts recorded yet</Text>
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
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipientDetails: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
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
  listContainer: {
    flex: 1,
    padding: 15,
  },
  shiftCard: {
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
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shiftBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  shiftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recordingCount: {
    fontSize: 14,
    color: '#4A90E2',
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
