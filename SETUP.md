# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npm start
   ```

3. **Run on your device**
   - Download "Expo Go" from App Store (iOS) or Play Store (Android)
   - Scan the QR code that appears in your terminal
   - The app will load on your device

## Testing the App

### Test as Care Recipient
1. Login with ID: `CR001`
2. You'll see a large record button
3. Tap to start recording (you'll need to grant microphone permission)
4. Tap again to stop recording
5. The recording will be saved (simulated for now)

### Test as Caregiver
1. Login with ID: `CG001`
2. You'll see a list of 3 care recipients
3. Tap on any care recipient (e.g., "John Doe")
4. View the work shifts
5. Tap on a shift to see recordings
6. Tap on a recording to:
   - Play the audio (simulated)
   - View existing notes
   - Add new notes

## Available Demo IDs

**Care Recipients:**
- CR001 (John Doe)
- CR002 (Mary Smith)
- CR003 (Emma Brown)

**Caregivers:**
- CG001 (Alice Johnson) - assigned to all 3 recipients
- CG002 (Bob Williams) - assigned to 2 recipients

## Current Features

✅ Role-based authentication
✅ Voice recording with visual feedback
✅ Care recipient list view
✅ Shift management
✅ Recording playback interface (simulated)
✅ Collaborative notes system
✅ Mock data for testing

## What's Not Yet Implemented

⏳ Actual audio playback
⏳ Cloud storage for recordings
⏳ Real-time data synchronization
⏳ User profile management
⏳ Settings and preferences

## Troubleshooting

**App won't start:**
- Make sure you have Node.js installed
- Try deleting `node_modules` and running `npm install` again

**QR code not working:**
- Make sure your phone and computer are on the same WiFi network
- Try the tunnel connection option: `npm start --tunnel`

**Permission errors:**
- Grant microphone permission when prompted
- Check your phone's app settings if recording doesn't work

## Next Steps for UI Improvements

Your friend can now:
1. Customize colors and theme
2. Add better icons
3. Improve animations
4. Enhance the recording interface
5. Add more visual polish
6. Implement custom fonts
7. Add loading states
8. Improve error handling UI
