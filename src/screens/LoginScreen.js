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
import { Colors, TextStyles, InputStyles, ButtonStyles, Shadows } from '../styles/CommonStyles';

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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: Colors.white,
    borderRadius: 16,
    ...Shadows.large,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 2.5,
    fontFamily: 'Helvetica',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textGray,
    marginBottom: 5,
    textAlign: 'center',
  },
  input: {
    ...InputStyles.base,
    borderColor: Colors.gray400,
    marginBottom: 20,
  },
  button: {
    ...ButtonStyles.base,
    ...ButtonStyles.primary,
  },
  buttonText: {
    ...TextStyles.buttonText,
  },
  helpSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  helpText: {
    ...TextStyles.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  branding: {
    marginTop: 3,
  },
  brandingText: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'center',
  },
  brandingBold: {
    fontWeight: '600',
    color: Colors.gray700,
  },
});