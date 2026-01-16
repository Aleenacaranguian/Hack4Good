import sqlite3

conn = sqlite3.connect('elderly_care.db')
cursor = conn.cursor()

tables = ['shifts', 'shift_notes', 'recordings', 'notes', 'users', 'care_recipients']

print('\nDatabase Status After Cleanup:')
print('=' * 40)

for table in tables:
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    print(f'{table:20s}: {count:3d} records')

conn.close()
