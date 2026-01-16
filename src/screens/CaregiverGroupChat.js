import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, TextStyles, InputStyles, ButtonStyles, ContainerStyles, BorderRadius, Shadows } from '../styles/CommonStyles';

export default function CaregiverGroupChat({ route, navigation }) {
  const { recipient, caregiver } = route.params;

  // Mock caregiver list - replace with actual data from your backend
  const caregivers = [
    { id: 'CG001', name: 'Alice Johnson' },
    { id: 'CG002', name: 'Michael Chen' },
    { id: 'CG003', name: 'Sarah Williams' },
  ];

  // Mock messages - in production, fetch from backend
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'CG001',
      senderName: 'Alice Johnson',
      message: `${recipient.name} had a good breakfast this morning!`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      senderId: 'CG002',
      senderName: 'Michael Chen',
      message: 'Thanks for the update. Did they take their medication?',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: '3',
      senderId: 'CG001',
      senderName: 'Alice Johnson',
      message: 'Yes, all medications taken at 9am',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      senderId: caregiver.id,
      senderName: caregiver.name,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Care Team Chat</Text>
        <Text style={styles.headerSubtitle}>Discussion about {recipient.name}</Text>
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsLabel}>Participants:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {caregivers.map((cg) => (
              <View key={cg.id} style={styles.participantBadge}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {cg.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Text style={styles.participantName}>{cg.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === caregiver.id;
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBox,
                isOwnMessage ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!isOwnMessage && (
                <Text style={styles.senderName}>{msg.senderName}</Text>
              )}
              <Text style={styles.messageText}>{msg.message}</Text>
              <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={Colors.gray500}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, newMessage.trim() === '' && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={newMessage.trim() === ''}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    ...Shadows.small,
  },
  headerTitle: {
    ...TextStyles.h3,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...TextStyles.small,
    color: Colors.gray600,
    marginBottom: 12,
  },
  participantsContainer: {
    marginTop: 8,
  },
  participantsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9A76',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantAvatarText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 13,
    color: Colors.gray700,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBox: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
    ...Shadows.small,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF9A76',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.gray600,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    alignItems: 'flex-end',
    ...Shadows.small,
  },
  input: {
    flex: 1,
    ...InputStyles.rounded,
    marginRight: 12,
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'center',
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#FF9A76',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
