"""
Migration script to make shift_id optional in recordings table.

This allows care recipients to upload recordings without requiring a shift to exist first.
Caregivers can later create shifts and associate recordings with them.

Run this with: python migrate_recordings.py
"""

import sqlite3
import os

DATABASE = 'elderly_care.db'

def migrate_recordings_table():
    """Make shift_id optional in recordings table"""

    if not os.path.exists(DATABASE):
        print(f"Error: Database file '{DATABASE}' not found!")
        return

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        print("\nStarting migration of recordings table...")

        # Check current schema
        cursor.execute('PRAGMA table_info(recordings)')
        columns = cursor.fetchall()
        print("\nCurrent schema:")
        for col in columns:
            print(f"  {col}")

        # Create new table with shift_id as optional
        print("\nCreating new recordings table with optional shift_id...")
        cursor.execute('''
            CREATE TABLE recordings_new (
                id TEXT PRIMARY KEY,
                shift_id TEXT,
                care_recipient_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                duration INTEGER,
                audio_url TEXT,
                FOREIGN KEY (shift_id) REFERENCES shifts(id),
                FOREIGN KEY (care_recipient_id) REFERENCES care_recipients(id)
            )
        ''')

        # Copy data from old table to new table
        print("Copying existing recordings...")
        cursor.execute('''
            INSERT INTO recordings_new (id, shift_id, care_recipient_id, timestamp, duration, audio_url)
            SELECT id, shift_id, care_recipient_id, timestamp, duration, audio_url
            FROM recordings
        ''')

        # Drop old table
        print("Removing old table...")
        cursor.execute('DROP TABLE recordings')

        # Rename new table to recordings
        print("Renaming new table...")
        cursor.execute('ALTER TABLE recordings_new RENAME TO recordings')

        # Commit changes
        conn.commit()

        # Verify new schema
        cursor.execute('PRAGMA table_info(recordings)')
        columns = cursor.fetchall()
        print("\nNew schema:")
        for col in columns:
            print(f"  {col}")

        # Check record count
        cursor.execute('SELECT COUNT(*) FROM recordings')
        count = cursor.fetchone()[0]
        print(f"\nMigration complete! {count} recordings preserved.")
        print("\nRecordings can now be created without requiring a shift_id.")

    except sqlite3.Error as e:
        print(f"\nError during migration: {e}")
        conn.rollback()
        print("Migration rolled back.")
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 60)
    print("  Migrate Recordings Table - Make shift_id Optional")
    print("=" * 60)

    response = input("\nThis will modify the recordings table structure. Continue? (yes/no): ")

    if response.lower() in ['yes', 'y']:
        migrate_recordings_table()
    else:
        print("\nMigration cancelled.")
