#!/usr/bin/env python3
"""
Script to seed the database with mock data.
Run this from the backend directory with: python seed_db.py
"""

import sqlite3
from datetime import datetime

DATABASE = 'elderly_care.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tables"""
    conn = get_db()
    cursor = conn.cursor()

    print("Creating tables...")

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
            date TEXT,
            care_recipient_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            duration INTEGER,
            audio_url TEXT,
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
    print("✅ Tables created successfully!")

def seed_database():
    """Seed database with mock data"""
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing data
    print("Clearing existing data...")
    try:
        cursor.execute('DELETE FROM shift_notes')
        cursor.execute('DELETE FROM notes')
        cursor.execute('DELETE FROM recordings')
        cursor.execute('DELETE FROM shifts')
        cursor.execute('DELETE FROM care_recipients')
        cursor.execute('DELETE FROM users')
        conn.commit()
    except sqlite3.OperationalError:
        # Tables don't exist yet, that's ok
        pass

    # Seed users
    print("Seeding users...")
    users = [
        ('CR001', 'John Doe', 'care-recipient', None),
        ('CR002', 'Mary Smith', 'care-recipient', None),
        ('CR003', 'Emma Brown', 'care-recipient', None),
        ('CG001', 'Alice Johnson', 'caregiver', 'CR001,CR002,CR003'),
        ('CG002', 'Bob Williams', 'caregiver', 'CR001,CR002'),
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', users)

    # Seed care recipients
    print("Seeding care recipients...")
    recipients = [
        ('CR001', 'John Doe', 78, '101'),
        ('CR002', 'Mary Smith', 82, '102'),
        ('CR003', 'Emma Brown', 75, '103'),
    ]
    cursor.executemany('INSERT INTO care_recipients VALUES (?, ?, ?, ?)', recipients)

    # Seed shifts
    print("Seeding shifts...")
    shifts = [
        ('S001', 'CR001', 1, 1, '2026-01-13'),
        ('S002', 'CR001', 2, 2, '2026-01-14'),
        ('S003', 'CR002', 1, 1, '2026-01-13'),
        ('S004', 'CR003', 1, 1, '2026-01-13'),
    ]
    cursor.executemany('INSERT INTO shifts VALUES (?, ?, ?, ?, ?)', shifts)

    # Seed recordings (linked by date instead of shift_id)
    print("Seeding recordings...")
    recordings = [
        ('R001', '2026-01-13', 'CR001', '2026-01-13T08:30:00', 45, None),
        ('R002', '2026-01-13', 'CR001', '2026-01-13T12:15:00', 30, None),
        ('R003', '2026-01-13', 'CR001', '2026-01-13T15:45:00', 60, None),
        ('R004', '2026-01-14', 'CR001', '2026-01-14T08:30:00', 50, None),
        ('R005', '2026-01-14', 'CR001', '2026-01-14T14:20:00', 40, None),
        ('R006', '2026-01-13', 'CR002', '2026-01-13T09:00:00', 35, None),
        ('R007', '2026-01-13', 'CR003', '2026-01-13T10:00:00', 55, None),
        ('R008', '2026-01-13', 'CR003', '2026-01-13T13:30:00', 42, None),
    ]
    cursor.executemany('INSERT INTO recordings VALUES (?, ?, ?, ?, ?, ?)', recordings)

    # Seed notes
    print("Seeding notes...")
    notes = [
        ('N001', 'R001', 'CG001', 'Alice Johnson', 'Patient mentioned feeling cold. Added extra blanket.', '2026-01-13T09:00:00'),
        ('N002', 'R003', 'CG002', 'Bob Williams', 'Discussed lunch menu preferences.', '2026-01-13T16:00:00'),
    ]
    cursor.executemany('INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?)', notes)

    conn.commit()
    conn.close()
    print("\n✅ Database seeded successfully!")
    print("\nSeeded data:")
    print("  - 5 users (3 care recipients, 2 caregivers)")
    print("  - 3 care recipients")
    print("  - 4 shifts")
    print("  - 8 recordings")
    print("  - 2 notes")
    print("\nYou can now login with:")
    print("  Care Recipients: CR001, CR002, CR003")
    print("  Caregivers: CG001, CG002")

if __name__ == '__main__':
    print("Starting database setup...\n")
    init_db()
    print()
    seed_database()
