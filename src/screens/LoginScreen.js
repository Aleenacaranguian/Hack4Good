import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
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
    <ImageBackground
      source={require('../../assets/caregiving-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Semi-transparent overlay */}
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Logo/Title - Made larger and more prominent */}
            <Text style={styles.title}>ALIGN</Text>
            <Text style={styles.subtitle}>Login with your ID</Text>

            {/* Input Field - Reduced margin */}
            <TextInput
              style={styles.input}
              placeholder="Enter User ID"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            {/* Login Button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Help Text - Replaced demo IDs */}
            <View style={styles.helpSection}>
              <Text style={styles.helpText}>
                To access your ID, please reach out to your Tsao Foundation officer
              </Text>
            </View>
          </View>

          {/* Tsao Foundation Branding */}
          <View style={styles.branding}>
            <Text style={styles.brandingText}>
              Powered by <Text style={styles.brandingBold}>Tsao Foundation</Text>
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255)', // Lighter overlay to see image better
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 50, // Made much larger
    fontWeight: 'bold',
    color: '#dc2626', // Red color
    marginBottom: 4, // Reduced spacing
    textAlign: 'center',
    letterSpacing: 2.5,
    fontFamily: 'Helvetica',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 5, // Reduced spacing
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#dc2626', // Red color
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  branding: {
    marginTop: 3,
  },
  brandingText: {
    fontSize: 13,
    color: 'black',
    textAlign: 'center',
  },
  brandingBold: {
    fontWeight: '600',
    color: '#374151',
  },
});