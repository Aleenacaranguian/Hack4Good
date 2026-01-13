# Elderly Care App - Backend API

Flask-based REST API for the Elderly Care mobile application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Database

The API uses SQLite for local development. The database is automatically initialized and seeded with mock data on first run.

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Notes
- `GET /recordings/<recording_id>/notes` - Get all notes for a recording
- `POST /recordings/<recording_id>/notes` - Add a new note
- `PUT /notes/<note_id>` - Update a note
- `DELETE /notes/<note_id>` - Delete a note

### Recordings
- `GET /recordings` - Get all recordings
- `GET /recordings/<recording_id>` - Get a specific recording with notes

### Shifts
- `GET /shifts` - Get all shifts
- `GET /shifts?care_recipient_id=<id>` - Get shifts for a specific care recipient

### Users
- `GET /users` - Get all users
- `GET /users/<user_id>` - Get a specific user

### Care Recipients
- `GET /care-recipients` - Get all care recipients
- `GET /care-recipients/<recipient_id>` - Get a specific care recipient

## Example Usage

### Add a note to a recording:
```bash
curl -X POST http://localhost:5000/recordings/R001/notes \
  -H "Content-Type: application/json" \
  -d '{
    "caregiverId": "CG001",
    "caregiverName": "Alice Johnson",
    "content": "Patient is doing well today"
  }'
```

### Get notes for a recording:
```bash
curl http://localhost:5000/recordings/R001/notes
```
