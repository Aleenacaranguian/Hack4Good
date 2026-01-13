from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

DATABASE = 'elderly_care.db'

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

if __name__ == '__main__':
    # Initialize database on first run
    if not os.path.exists(DATABASE):
        init_db()
        seed_database()

    app.run(debug=True, host='0.0.0.0', port=5000)
