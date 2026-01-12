import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { mockUsers } from '../data/mockData';

export default function LoginScreen({ navigation, setUser }) {
  const [userId, setUserId] = useState('');

  const handleLogin = () => {
    const user = mockUsers.find(u => u.id === userId);

    if (user) {
      setUser(user);
      if (user.role === 'care-recipient') {
        navigation.replace('CareRecipientHome', { user });
      } else if (user.role === 'caregiver') {
        navigation.replace('CaregiverHome', { user });
      }
    } else {
      Alert.alert('Error', 'Invalid User ID');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Elderly Care App</Text>
        <Text style={styles.subtitle}>Login with your ID</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter User ID"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo IDs:</Text>
          <Text style={styles.demoText}>Care Recipient: CR001</Text>
          <Text style={styles.demoText}>Caregiver: CG001</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
