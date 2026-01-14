//caregiverhome.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { careRecipients } from '../data/mockData';

export default function CaregiverHome({ route, navigation }) {
  const { user } = route.params;

  const assignedRecipients = careRecipients.filter(recipient =>
    user.assignedRecipients.includes(recipient.id)
  );

  const handleRecipientPress = (recipient) => {
    navigation.navigate('CareRecipientDetail', { recipient, caregiver: user });
  };

  const handleLogout = () => {
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
          onPress: () => {
            // Clear any authentication tokens
            // await AsyncStorage.removeItem('userToken');
            // await AsyncStorage.removeItem('userData');
            
            // Navigate back to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user.name}</Text>
            <Text style={styles.subtitle}>Your Care Recipients</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >

            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {assignedRecipients.map((recipient, index) => (
          <TouchableOpacity
            key={recipient.id}
            style={[
              styles.card,
              { marginTop: index === 0 ? 0 : 0 }
            ]}
            onPress={() => handleRecipientPress(recipient)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {recipient.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailText}>Age: {recipient.age}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailText}>Room: {recipient.room}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {assignedRecipients.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No care recipients assigned</Text>
            <Text style={styles.emptySubtext}>Check back later for assignments</Text>
          </View>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
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
  subtitle: {
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcc',
    marginLeft: 12,
  },

  logoutText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrow: {
    fontSize: 24,
    color: 'red',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});