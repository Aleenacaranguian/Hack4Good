// API Service for communicating with Flask backend

// Update this to your machine's IP address when testing on a physical device
// For iOS Simulator: use localhost or 127.0.0.1
// For Android Emulator: use 10.0.2.2
// For Physical Device: use your computer's local IP (e.g., 192.168.1.x)
const API_BASE_URL = 'http:/10.211.225.128:5000';

class ApiService {
  /**
   * Make a fetch request with error handling
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============= NOTES API =============

  /**
   * Get all notes for a recording
   */
  async getNotes(recordingId) {
    return this.request(`/recordings/${recordingId}/notes`);
  }

  /**
   * Add a new note to a recording
   */
  async addNote(recordingId, noteData) {
    return this.request(`/recordings/${recordingId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId, content) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // ============= RECORDINGS API =============

  /**
   * Get all recordings
   */
  async getRecordings() {
    const recordings = await this.request('/recordings');

    // Map snake_case to camelCase for consistency
    return recordings.map(recording => ({
      ...recording,
      shiftId: recording.shift_id,
      careRecipientId: recording.care_recipient_id,
      audioUrl: recording.audio_url,
    }));
  }

  /**
   * Get a specific recording with its notes
   */
  async getRecording(recordingId) {
    const recording = await this.request(`/recordings/${recordingId}`);

    // Map snake_case to camelCase for consistency
    return {
      ...recording,
      shiftId: recording.shift_id,
      careRecipientId: recording.care_recipient_id,
      audioUrl: recording.audio_url,
    };
  }

  /**
   * Create a new recording
   */
  async createRecording(recordingData) {
    console.log('[API] createRecording called with:', recordingData);
    console.log('[API] Sending POST to:', `${API_BASE_URL}/recordings`);
    try {
      const result = await this.request('/recordings', {
        method: 'POST',
        body: JSON.stringify(recordingData),
      });
      console.log('[API] createRecording success:', result);
      return result;
    } catch (error) {
      console.error('[API] createRecording failed:', error);
      throw error;
    }
  }

  // ============= SHIFTS API =============

  /**
   * Get all shifts, optionally filtered by care recipient
   */
  async getShifts(careRecipientId = null) {
    const query = careRecipientId ? `?care_recipient_id=${careRecipientId}` : '';
    const shifts = await this.request(`/shifts${query}`);

    // Map snake_case to camelCase for consistency
    return shifts.map(shift => ({
      ...shift,
      shiftNumber: shift.shift_number,
      careRecipientId: shift.care_recipient_id,
      // Keep original properties for backward compatibility
    }));
  }

  /**
   * Get a specific shift
   */
  async getShift(shiftId) {
    return this.request(`/shifts/${shiftId}`);
  }

  /**
   * Create a new shift
   */
  async createShift(shiftData) {
    const shift = await this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });

    // Map snake_case to camelCase for consistency
    return {
      ...shift,
      shiftNumber: shift.shift_number,
      careRecipientId: shift.care_recipient_id,
    };
  }

  // ============= SHIFT NOTES API =============

  /**
   * Get all notes for a shift
   */
  async getShiftNotes(shiftId) {
    return this.request(`/shifts/${shiftId}/notes`);
  }

  /**
   * Analyze shift notes using AI
   */
  async analyzeShift(shiftId) {
    return this.request(`/shifts/${shiftId}/analyze`, {
      method: 'POST',
    });
  }

  /**
   * Add a new note to a shift
   */
  async addShiftNote(shiftId, noteData) {
    return this.request(`/shifts/${shiftId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Update an existing shift note
   */
  async updateShiftNote(noteId, content) {
    return this.request(`/shift-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  /**
   * Delete a shift note
   */
  async deleteShiftNote(noteId) {
    return this.request(`/shift-notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // ============= AI/GEMINI API =============

  /**
   * Analyze shift notes and get AI-powered suggestions for next shift
   */
  async analyzeShiftNotes(shiftId) {
    return this.request(`/shifts/${shiftId}/analyze`, {
      method: 'POST',
    });
  }

  /**
   * Get AI-generated summary of shift notes
   */
  async getShiftSummary(shiftId) {
    return this.request(`/shifts/${shiftId}/summary`);
  }

  // ============= USERS API =============

  /**
   * Get all users
   */
  async getUsers() {
    return this.request('/users');
  }

  /**
   * Get a specific user
   */
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  // ============= CARE RECIPIENTS API =============

  /**
   * Get all care recipients
   */
  async getCareRecipients() {
    return this.request('/care-recipients');
  }

  /**
   * Get a specific care recipient
   */
  async getCareRecipient(recipientId) {
    return this.request(`/care-recipients/${recipientId}`);
  }

  // ============= HEALTH CHECK =============

  /**
   * Check if the server is running
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Export a singleton instance
export default new ApiService();
