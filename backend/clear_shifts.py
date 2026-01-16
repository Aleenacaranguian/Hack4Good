"""
Script to clear old shift data and shift notes while preserving recordings.

This script will:
1. Delete all shift notes
2. Delete all shifts
3. Keep all recordings (they will become orphaned temporarily)
4. Caregivers can create new shifts and recordings will be re-associated

Run this with: python clear_shifts.py
"""

import sqlite3
import os

DATABASE = 'elderly_care.db'

def clear_shifts_and_notes():
    """Clear shifts and shift notes while keeping recordings"""

    if not os.path.exists(DATABASE):
        print(f"Error: Database file '{DATABASE}' not found!")
        return

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        # Get counts before deletion
        cursor.execute('SELECT COUNT(*) FROM shifts')
        shift_count = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM shift_notes')
        shift_notes_count = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM recordings')
        recordings_count = cursor.fetchone()[0]

        print(f"\nCurrent Database Status:")
        print(f"  - Shifts: {shift_count}")
        print(f"  - Shift Notes: {shift_notes_count}")
        print(f"  - Recordings: {recordings_count} (will be preserved)")

        # Delete shift notes first (foreign key constraint)
        print(f"\nDeleting {shift_notes_count} shift notes...")
        cursor.execute('DELETE FROM shift_notes')

        # Delete shifts
        print(f"Deleting {shift_count} shifts...")
        cursor.execute('DELETE FROM shifts')

        # Commit the changes
        conn.commit()

        # Verify deletion
        cursor.execute('SELECT COUNT(*) FROM shifts')
        remaining_shifts = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM shift_notes')
        remaining_notes = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM recordings')
        remaining_recordings = cursor.fetchone()[0]

        print(f"\nCleanup Complete!")
        print(f"  - Shifts remaining: {remaining_shifts}")
        print(f"  - Shift notes remaining: {remaining_notes}")
        print(f"  - Recordings preserved: {remaining_recordings}")

        print(f"\nNote: Recordings are preserved but currently orphaned.")
        print(f"   They will need to be re-associated with new shifts.")
        print(f"   Caregivers should create new shifts using the app.\n")

    except sqlite3.Error as e:
        print(f"\nError: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 60)
    print("  Clear Shifts & Shift Notes (Preserve Recordings)")
    print("=" * 60)

    response = input("\nWARNING: This will delete all shifts and shift notes. Continue? (yes/no): ")

    if response.lower() in ['yes', 'y']:
        clear_shifts_and_notes()
    else:
        print("\nOperation cancelled.")
