from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
from dotenv import load_dotenv
from gemini_service import GeminiService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

DATABASE = 'elderly_care.db'

# Initialize Gemini service (will be None if API key not configured)
try:
    gemini_service = GeminiService()
    print("Gemini AI service initialized successfully!")
except Exception as e:
    gemini_service = None
    print(f"Warning: Gemini AI service not available: {e}")

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def init_db():
    """Initialize database with tables"""
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            assigned_recipients TEXT
        )
    ''')

    # Care recipients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS care_recipients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            room TEXT
        )
    ''')

    # Shifts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shifts (
            id TEXT PRIMARY KEY,
            care_recipient_id TEXT NOT NULL,
            shift_number INTEGER,
            day INTEGER,
            date TEXT,
            FOREIGN KEY (care_recipient_id) REFERENCES care_recipients(id)
        )
    ''')

    # Recordings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recordings (
            id TEXT PRIMARY KEY,
            shift_id TEXT NOT NULL,
            care_recipient_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            duration INTEGER,
            audio_url TEXT,
            FOREIGN KEY (shift_id) REFERENCES shifts(id),
            FOREIGN KEY (care_recipient_id) REFERENCES care_recipients(id)
        )
    ''')

    # Notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            recording_id TEXT NOT NULL,
            caregiver_id TEXT NOT NULL,
            caregiver_name TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (recording_id) REFERENCES recordings(id),
            FOREIGN KEY (caregiver_id) REFERENCES users(id)
        )
    ''')

    # Shift notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shift_notes (
            id TEXT PRIMARY KEY,
            shift_id TEXT NOT NULL,
            caregiver_id TEXT NOT NULL,
            caregiver_name TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (shift_id) REFERENCES shifts(id),
            FOREIGN KEY (caregiver_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def seed_database():
    """Seed database with mock data"""
    conn = get_db()
    cursor = conn.cursor()

    # Check if data already exists
    cursor.execute('SELECT COUNT(*) as count FROM users')
    if cursor.fetchone()['count'] > 0:
        conn.close()
        return  # Data already seeded

    # Seed users
    users = [
        ('CR001', 'John Doe', 'care-recipient', None),
        ('CR002', 'Mary Smith', 'care-recipient', None),
        ('CR003', 'Emma Brown', 'care-recipient', None),
        ('CG001', 'Alice Johnson', 'caregiver', 'CR001,CR002,CR003'),
        ('CG002', 'Bob Williams', 'caregiver', 'CR001,CR002'),
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', users)

    # Seed care recipients
    recipients = [
        ('CR001', 'John Doe', 78, '101'),
        ('CR002', 'Mary Smith', 82, '102'),
        ('CR003', 'Emma Brown', 75, '103'),
    ]
    cursor.executemany('INSERT INTO care_recipients VALUES (?, ?, ?, ?)', recipients)

    # Seed shifts
    shifts = [
        ('S001', 'CR001', 1, 1, '2026-01-13'),
        ('S002', 'CR001', 2, 2, '2026-01-14'),
        ('S003', 'CR002', 1, 1, '2026-01-13'),
        ('S004', 'CR003', 1, 1, '2026-01-13'),
    ]
    cursor.executemany('INSERT INTO shifts VALUES (?, ?, ?, ?, ?)', shifts)

    # Seed recordings
    recordings = [
        ('R001', 'S001', 'CR001', '2026-01-13T08:30:00', 45, None),
        ('R002', 'S001', 'CR001', '2026-01-13T12:15:00', 30, None),
        ('R003', 'S001', 'CR001', '2026-01-13T15:45:00', 60, None),
        ('R004', 'S002', 'CR001', '2026-01-14T08:30:00', 50, None),
        ('R005', 'S002', 'CR001', '2026-01-14T14:20:00', 40, None),
        ('R006', 'S003', 'CR002', '2026-01-13T09:00:00', 35, None),
        ('R007', 'S004', 'CR003', '2026-01-13T10:00:00', 55, None),
        ('R008', 'S004', 'CR003', '2026-01-13T13:30:00', 42, None),
    ]
    cursor.executemany('INSERT INTO recordings VALUES (?, ?, ?, ?, ?, ?)', recordings)

    # Seed notes
    notes = [
        ('N001', 'R001', 'CG001', 'Alice Johnson', 'Patient mentioned feeling cold. Added extra blanket.', '2026-01-13T09:00:00'),
        ('N002', 'R003', 'CG002', 'Bob Williams', 'Discussed lunch menu preferences.', '2026-01-13T16:00:00'),
    ]
    cursor.executemany('INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?)', notes)

    conn.commit()
    conn.close()
    print("Database seeded successfully!")

# ============= API ENDPOINTS =============

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

# ============= NOTES ENDPOINTS =============

@app.route('/recordings/<recording_id>/notes', methods=['GET'])
def get_notes(recording_id):
    """Get all notes for a recording"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM notes
        WHERE recording_id = ?
        ORDER BY timestamp DESC
    ''', (recording_id,))
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(notes)

@app.route('/recordings/<recording_id>/notes', methods=['POST'])
def add_note(recording_id):
    """Add a new note to a recording"""
    data = request.json

    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400

    note_id = f"N{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO notes (id, recording_id, caregiver_id, caregiver_name, content, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        note_id,
        recording_id,
        data.get('caregiverId'),
        data.get('caregiverName'),
        data.get('content'),
        timestamp
    ))
    conn.commit()

    # Return the created note
    cursor.execute('SELECT * FROM notes WHERE id = ?', (note_id,))
    note = dict(cursor.fetchone())
    conn.close()

    return jsonify(note), 201

@app.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    """Update an existing note"""
    data = request.json

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE notes
        SET content = ?
        WHERE id = ?
    ''', (data.get('content'), note_id))
    conn.commit()

    cursor.execute('SELECT * FROM notes WHERE id = ?', (note_id,))
    note = dict(cursor.fetchone())
    conn.close()

    return jsonify(note)

@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Note deleted successfully'})

# ============= RECORDINGS ENDPOINTS =============

@app.route('/recordings', methods=['GET'])
def get_recordings():
    """Get all recordings"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM recordings ORDER BY timestamp DESC')
    recordings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(recordings)

@app.route('/recordings', methods=['POST'])
def create_recording():
    """Create a new recording"""
    print("=== RECEIVED POST /recordings REQUEST ===")
    data = request.json
    print(f"Request data: {data}")

    if not data.get('care_recipient_id') or not data.get('shift_id'):
        print("ERROR: Missing required fields")
        return jsonify({'error': 'care_recipient_id and shift_id are required'}), 400

    recording_id = f"R{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO recordings (id, shift_id, care_recipient_id, timestamp, duration, audio_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        recording_id,
        data.get('shift_id'),
        data.get('care_recipient_id'),
        timestamp,
        data.get('duration', 0),
        data.get('audio_url')
    ))
    conn.commit()

    # Return the created recording
    cursor.execute('SELECT * FROM recordings WHERE id = ?', (recording_id,))
    recording = dict(cursor.fetchone())
    conn.close()

    print(f"SUCCESS: Created recording {recording_id}")
    return jsonify(recording), 201

@app.route('/recordings/<recording_id>', methods=['GET'])
def get_recording(recording_id):
    """Get a specific recording with its notes"""
    conn = get_db()
    cursor = conn.cursor()

    # Get recording
    cursor.execute('SELECT * FROM recordings WHERE id = ?', (recording_id,))
    recording = dict(cursor.fetchone())

    # Get notes for this recording
    cursor.execute('SELECT * FROM notes WHERE recording_id = ? ORDER BY timestamp DESC', (recording_id,))
    recording['notes'] = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return jsonify(recording)

# ============= SHIFT NOTES ENDPOINTS =============

@app.route('/shifts/<shift_id>/notes', methods=['GET'])
def get_shift_notes(shift_id):
    """Get all notes for a shift"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM shift_notes
        WHERE shift_id = ?
        ORDER BY timestamp DESC
    ''', (shift_id,))
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(notes)

@app.route('/shifts/<shift_id>/notes', methods=['POST'])
def add_shift_note(shift_id):
    """Add a new note to a shift"""
    data = request.json

    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400

    note_id = f"SN{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO shift_notes (id, shift_id, caregiver_id, caregiver_name, content, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        note_id,
        shift_id,
        data.get('caregiverId'),
        data.get('caregiverName'),
        data.get('content'),
        timestamp
    ))
    conn.commit()

    # Return the created note
    cursor.execute('SELECT * FROM shift_notes WHERE id = ?', (note_id,))
    note = dict(cursor.fetchone())
    conn.close()

    return jsonify(note), 201

@app.route('/shift-notes/<note_id>', methods=['PUT'])
def update_shift_note(note_id):
    """Update an existing shift note"""
    data = request.json

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE shift_notes
        SET content = ?
        WHERE id = ?
    ''', (data.get('content'), note_id))
    conn.commit()

    cursor.execute('SELECT * FROM shift_notes WHERE id = ?', (note_id,))
    note = dict(cursor.fetchone())
    conn.close()

    return jsonify(note)

@app.route('/shift-notes/<note_id>', methods=['DELETE'])
def delete_shift_note(note_id):
    """Delete a shift note"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM shift_notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Shift note deleted successfully'})

# ============= SHIFTS ENDPOINTS =============

@app.route('/shifts', methods=['GET'])
def get_shifts():
    """Get all shifts"""
    care_recipient_id = request.args.get('care_recipient_id')

    conn = get_db()
    cursor = conn.cursor()

    if care_recipient_id:
        cursor.execute('SELECT * FROM shifts WHERE care_recipient_id = ?', (care_recipient_id,))
    else:
        cursor.execute('SELECT * FROM shifts')

    shifts = [dict(row) for row in cursor.fetchall()]

    # Get recordings for each shift
    for shift in shifts:
        cursor.execute('SELECT * FROM recordings WHERE shift_id = ?', (shift['id'],))
        shift['recordings'] = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return jsonify(shifts)

# ============= USERS ENDPOINTS =============

@app.route('/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(users)

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify(dict(user))
    return jsonify({'error': 'User not found'}), 404

# ============= CARE RECIPIENTS ENDPOINTS =============

@app.route('/care-recipients', methods=['GET'])
def get_care_recipients():
    """Get all care recipients"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM care_recipients')
    recipients = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(recipients)

@app.route('/care-recipients/<recipient_id>', methods=['GET'])
def get_care_recipient(recipient_id):
    """Get a specific care recipient"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM care_recipients WHERE id = ?', (recipient_id,))
    recipient = cursor.fetchone()
    conn.close()

    if recipient:
        return jsonify(dict(recipient))
    return jsonify({'error': 'Care recipient not found'}), 404

# ============= AI/GEMINI ENDPOINTS =============

@app.route('/shifts/<shift_id>/analyze', methods=['POST'])
def analyze_shift_notes(shift_id):
    """
    Analyze shift notes using Gemini AI and provide suggestions
    """
    if not gemini_service:
        return jsonify({
            'error': 'AI service not available. Please configure GEMINI_API_KEY in .env file.'
        }), 503

    conn = get_db()
    cursor = conn.cursor()

    # Get shift information
    cursor.execute('SELECT * FROM shifts WHERE id = ?', (shift_id,))
    shift = cursor.fetchone()

    if not shift:
        conn.close()
        return jsonify({'error': 'Shift not found'}), 404

    shift_dict = dict(shift)

    # Get care recipient name
    cursor.execute('SELECT name FROM care_recipients WHERE id = ?', (shift_dict['care_recipient_id'],))
    recipient = cursor.fetchone()
    care_recipient_name = dict(recipient)['name'] if recipient else None

    # Get all shift notes
    cursor.execute('''
        SELECT * FROM shift_notes
        WHERE shift_id = ?
        ORDER BY timestamp ASC
    ''', (shift_id,))
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()

    if not notes:
        return jsonify({
            'suggestions': [],
            'summary': 'No shift notes available for this shift.',
            'priorities': []
        })

    # Prepare shift context
    shift_context = {
        'shift_number': shift_dict.get('shift_number'),
        'date': shift_dict.get('date'),
        'day': shift_dict.get('day')
    }

    # Call Gemini service to analyze notes
    try:
        analysis = gemini_service.analyze_shift_notes(
            shift_notes=notes,
            care_recipient_name=care_recipient_name,
            shift_context=shift_context
        )
        return jsonify(analysis)
    except Exception as e:
        return jsonify({
            'error': f'Error analyzing shift notes: {str(e)}',
            'suggestions': [],
            'summary': '',
            'priorities': []
        }), 500

@app.route('/shifts/<shift_id>/summary', methods=['GET'])
def get_shift_summary(shift_id):
    """
    Generate a concise AI summary of shift notes
    """
    if not gemini_service:
        return jsonify({
            'error': 'AI service not available. Please configure GEMINI_API_KEY in .env file.'
        }), 503

    conn = get_db()
    cursor = conn.cursor()

    # Get all shift notes
    cursor.execute('''
        SELECT * FROM shift_notes
        WHERE shift_id = ?
        ORDER BY timestamp ASC
    ''', (shift_id,))
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()

    if not notes:
        return jsonify({'summary': 'No notes recorded for this shift.'})

    try:
        summary = gemini_service.generate_shift_summary(notes)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({
            'error': f'Error generating summary: {str(e)}',
            'summary': ''
        }), 500

if __name__ == '__main__':
    # Initialize database on first run
    if not os.path.exists(DATABASE):
        init_db()
        seed_database()

    app.run(debug=True, host='0.0.0.0', port=5000)
