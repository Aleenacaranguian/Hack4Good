# Quick Start: Gemini AI Integration

Get your AI-powered shift note analysis up and running in 5 minutes!

## Step 1: Get Your API Key (2 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

## Step 2: Configure Backend (1 minute)

1. Create a `.env` file in the `backend` folder:
   ```bash
   cd backend
   ```

2. Add this line to the `.env` file:
   ```
   GEMINI_API_KEY=paste_your_key_here
   ```

## Step 3: Install Dependencies (1 minute)

```bash
cd backend
pip install -r requirements.txt
```

## Step 4: Start the Server (1 minute)

```bash
python app.py
```

You should see: `Gemini AI service initialized successfully!`

## Step 5: Test It! (Quick)

Use these API endpoints:

### Analyze Shift Notes
```javascript
// In your React Native app
import api from './services/api';

const analysis = await api.analyzeShiftNotes('S001');
console.log(analysis);
// Output: { summary: "...", suggestions: [...], priorities: [...] }
```

### Get Quick Summary
```javascript
const { summary } = await api.getShiftSummary('S001');
console.log(summary);
// Output: "Brief summary of shift activities..."
```

## That's It!

Your app now has AI-powered shift analysis.

For detailed examples and UI integration, see [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md)

## Troubleshooting

**See "AI service not available" error?**
- Check `.env` file is in `backend` folder
- Verify API key has no extra spaces
- Restart Flask server

**Need help?**
- Read full docs: [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md)
- Check API key: [Google AI Studio](https://makersuite.google.com/)
