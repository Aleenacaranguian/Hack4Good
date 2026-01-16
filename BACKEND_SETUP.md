# Backend Setup Guide

This guide will help you set up and run the Flask backend API for persistent storage of notes and other data.

## Prerequisites

- Python 3.8 or higher installed
- pip (Python package manager)

## Setup Instructions

### 1. Install Python Dependencies

Open a terminal and navigate to the backend directory:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Backend Server

From the backend directory, run:

```bash
python app.py
```

You should see output like:
```
Database initialized successfully!
Database seeded successfully!
 * Running on http://0.0.0.0:5000
```

The server is now running on `http://localhost:5000`

### 3. Configure the React Native App

The app is configured to connect to `http://localhost:5000` by default. However, you may need to change this depending on how you're running the app:

**Edit `src/services/api.js` and update `API_BASE_URL`:**

- **iOS Simulator**: Use `http://localhost:5000` (default)
- **Android Emulator**: Use `http://10.0.2.2:5000`
- **Physical Device**: Use your computer's local IP address (e.g., `http://192.168.1.10:5000`)

To find your local IP address:
- **Windows**: Run `ipconfig` in Command Prompt and look for "IPv4 Address"
- **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your local network IP

### 4. Test the Connection

Once both the backend and frontend are running:

1. Open the app in r  simulator/device
2. Navigate to a recording detail page
3. Try adding a note
4. The note should be saved to the database and visible to all users

## Troubleshooting

### "Failed to load notes" error

This means the app cannot connect to the backend. Check:

1. Backend server is running (`python app.py`)
2. `API_BASE_URL` in `src/services/api.js` is correct for your setup
3. No firewall blocking the connection
4. For physical devices, make sure your phone and computer are on the same WiFi network

### Port already in use

If port 5000 is already taken, you can change it in `backend/app.py`:

```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change to any available port
```

Then update `API_BASE_URL` in `src/services/api.js` to match.

## Database

The backend uses SQLite, stored in `backend/elderly_care.db`. The database is automatically created and seeded with mock data on first run.

To reset the database, simply delete `elderly_care.db` and restart the server.

## API Endpoints

See `backend/README.md` for a complete list of available API endpoints.

## Production Deployment

For production, you'll want to:

1. Use a production WSGI server like Gunicorn instead of Flask's development server
2. Use PostgreSQL or MySQL instead of SQLite for better concurrent access
3. Add authentication and authorization
4. Deploy to a cloud platform (AWS, Google Cloud, Heroku, etc.)
5. Use HTTPS for secure communication
