# Google Gemini AI Integration Setup Guide

This guide explains how to set up and use the Google Gemini AI integration for analyzing caregiver shift notes and providing intelligent suggestions.

## Overview

The Gemini AI integration provides:
- **Shift Note Analysis**: AI-powered analysis of caregiver notes with actionable suggestions
- **Smart Suggestions**: Recommendations for the next shift based on patterns and observations
- **Priority Identification**: Highlights critical items requiring immediate attention
- **Automated Summaries**: Concise summaries of shift activities

## Getting Your Gemini API Key

### Step 1: Access Google AI Studio

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API Key" or "Create API Key"

### Step 2: Create a New API Key

1. Click "Create API key in new project" (or select an existing project)
2. Copy the generated API key
3. **IMPORTANT**: Keep this key secure and never commit it to version control

## Backend Setup

### Step 1: Create Environment File

1. In the `backend` folder, create a file named `.env`:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

2. Add your Gemini API key to the `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key you copied from Google AI Studio.

### Step 2: Install Dependencies

Install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `google-generativeai`: Google's Gemini API client
- All other existing dependencies

### Step 3: Verify Setup

1. Start the Flask backend:

```bash
python app.py
```

2. You should see this message in the console:
```
Gemini AI service initialized successfully!
```

If you see a warning instead, check that:
- Your `.env` file is in the `backend` folder
- The `GEMINI_API_KEY` is correctly set
- There are no extra spaces or quotes around the key

## API Endpoints

### 1. Analyze Shift Notes

**Endpoint**: `POST /shifts/{shift_id}/analyze`

**Description**: Analyzes all notes for a shift and provides suggestions for the next shift.

**Response**:
```json
{
  "summary": "Brief summary of the shift...",
  "suggestions": [
    "Suggestion 1...",
    "Suggestion 2...",
    "Suggestion 3..."
  ],
  "priorities": [
    "Priority item 1...",
    "Priority item 2..."
  ]
}
```

**Example Usage** (from React Native):
```javascript
import api from './services/api';

const analyzeShift = async (shiftId) => {
  try {
    const analysis = await api.analyzeShiftNotes(shiftId);
    console.log('Summary:', analysis.summary);
    console.log('Suggestions:', analysis.suggestions);
    console.log('Priorities:', analysis.priorities);
  } catch (error) {
    console.error('Error analyzing shift:', error);
  }
};
```

### 2. Get Shift Summary

**Endpoint**: `GET /shifts/{shift_id}/summary`

**Description**: Generates a concise summary of shift notes.

**Response**:
```json
{
  "summary": "Concise summary of the shift notes..."
}
```

**Example Usage**:
```javascript
const getShiftSummary = async (shiftId) => {
  try {
    const { summary } = await api.getShiftSummary(shiftId);
    console.log('Shift Summary:', summary);
  } catch (error) {
    console.error('Error getting summary:', error);
  }
};
```

## React Native Integration Examples

### Example 1: Display AI Suggestions in a Component

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api';

const ShiftAnalysis = ({ shiftId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeShift = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyzeShiftNotes(shiftId);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button title="Get AI Suggestions" onPress={analyzeShift} />

      {loading && <ActivityIndicator size="large" />}

      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}

      {analysis && (
        <ScrollView>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Summary</Text>
          <Text>{analysis.summary}</Text>

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>
            Suggestions for Next Shift
          </Text>
          {analysis.suggestions.map((suggestion, index) => (
            <Text key={index}>• {suggestion}</Text>
          ))}

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>
            Priorities
          </Text>
          {analysis.priorities.map((priority, index) => (
            <Text key={index} style={{ color: 'red' }}>
              🔴 {priority}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ShiftAnalysis;
```

### Example 2: Auto-Generate Summary When Viewing Shift

```javascript
const ShiftDetailsScreen = ({ route }) => {
  const { shiftId } = route.params;
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const result = await api.getShiftSummary(shiftId);
        setSummary(result.summary);
      } catch (err) {
        console.error('Failed to load summary:', err);
      }
    };

    loadSummary();
  }, [shiftId]);

  return (
    <View>
      <Text style={{ fontSize: 16, fontStyle: 'italic' }}>
        {summary || 'Loading summary...'}
      </Text>
    </View>
  );
};
```

## How the AI Analysis Works

### What the AI Analyzes

The Gemini AI reviews shift notes and looks for:
1. **Patterns**: Recurring observations or concerns
2. **Action Items**: Follow-up tasks mentioned by caregivers
3. **Health Concerns**: Any symptoms or changes in condition
4. **Care Quality**: Opportunities to improve care delivery
5. **Communication Gaps**: Information that needs to be shared

### AI-Generated Suggestions Include

- **Follow-up Actions**: "Monitor patient's temperature more frequently due to reported chills"
- **Preventive Measures**: "Ensure extra blankets are available given recent cold sensitivity"
- **Care Improvements**: "Consider adjusting meal schedule based on appetite patterns"
- **Team Communication**: "Share medication timing observations with next caregiver"

### Priorities Focus On

- Immediate health concerns
- Safety-related items
- Time-sensitive actions
- Critical information for continuity of care

## Best Practices

### For Shift Notes

To get the best AI suggestions, caregivers should:
- Be specific in observations (e.g., "Patient complained of headache at 2 PM" vs "Patient not feeling well")
- Include context (e.g., "Refused lunch - mentioned feeling nauseous")
- Note any changes from usual behavior
- Document interventions taken

### For Using AI Features

- Run analysis at the end of each shift for next caregiver
- Review priorities before starting a new shift
- Use summaries for quick handoff during shift changes
- Don't rely solely on AI - use it to supplement professional judgment

## Troubleshooting

### "AI service not available" Error

**Cause**: Gemini API key not configured or invalid

**Solution**:
1. Verify `.env` file exists in `backend` folder
2. Check that `GEMINI_API_KEY` is set correctly
3. Restart the Flask server after adding the key
4. Ensure no extra spaces or quotes in the `.env` file

### API Key Invalid

**Cause**: Incorrect or expired API key

**Solution**:
1. Go back to Google AI Studio
2. Generate a new API key
3. Update the `.env` file
4. Restart the server

### Rate Limit Errors

**Cause**: Too many API calls in a short time

**Solution**:
- Gemini has rate limits on free tier
- Consider caching analysis results
- Upgrade to paid tier if needed for production use

### No Suggestions Generated

**Cause**: No shift notes available or notes are too brief

**Solution**:
- Ensure shift has notes before analyzing
- Encourage caregivers to write detailed notes
- At least 2-3 meaningful notes recommended for good analysis

## Cost Considerations

### Free Tier
- Google Gemini API offers a generous free tier
- Suitable for development and small-scale use
- Check current limits at [Google AI Studio](https://ai.google.dev/pricing)

### Paid Tier
- For production apps with many users
- Pay-per-request pricing
- Monitor usage in Google Cloud Console

## Privacy and Security

### Data Handling
- Shift notes are sent to Google's Gemini API for analysis
- Google's privacy policy applies to data processed
- Review [Google's AI Terms of Service](https://ai.google.dev/terms)

### Recommendations
- Remove or anonymize sensitive patient information before analysis if needed
- Use patient IDs instead of full names in notes
- Consider compliance requirements (HIPAA, etc.) for your use case
- Store API keys securely (never in code or version control)

## Next Steps

1. **Test the Integration**: Try analyzing some sample shift notes
2. **Create UI Components**: Build React Native screens to display suggestions
3. **Customize Prompts**: Modify `gemini_service.py` to adjust AI behavior
4. **Add Features**: Consider adding more AI-powered features like:
   - Trend analysis across multiple shifts
   - Automated alerts for concerning patterns
   - Medication reminder suggestions
   - Care plan recommendations

## Support and Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Python SDK Reference](https://ai.google.dev/api/python/google/generativeai)

## Example Output

Here's what an actual AI analysis might look like:

**Input Notes**:
- "Patient mentioned feeling cold during afternoon rounds. Added extra blanket."
- "Appetite was low at lunch - only ate half the meal. Mentioned nausea."
- "Evening medication taken without issues at 6 PM."

**AI Analysis Output**:

**Summary**: The patient experienced cold sensitivity and reduced appetite with nausea during the shift. Medications were administered successfully in the evening.

**Suggestions**:
- Monitor patient's temperature regularly to rule out fever or infection
- Offer smaller, more frequent meals if nausea persists
- Keep extra blankets readily available in room
- Document food intake at each meal to track appetite trends
- Consider consulting with healthcare provider if nausea continues

**Priorities**:
- Check temperature at start of next shift
- Monitor and document nausea symptoms
- Ensure patient comfort regarding room temperature
