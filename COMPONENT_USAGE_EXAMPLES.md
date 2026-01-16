# React Native Component Usage Examples

This guide shows you how to use the AI-powered components in your app screens.

## Available Components

1. **ShiftAIAnalysis** - Full-featured component with suggestions and priorities
2. **ShiftSummaryBanner** - Simple banner that auto-loads shift summary

## Component 1: ShiftAIAnalysis

Full-featured component that displays AI analysis with suggestions for the next shift.

### Import

```javascript
import ShiftAIAnalysis from '../components/ShiftAIAnalysis';
```

### Basic Usage

```javascript
import React from 'react';
import { View, ScrollView } from 'react-native';
import ShiftAIAnalysis from '../components/ShiftAIAnalysis';

const ShiftDetailsScreen = ({ route }) => {
  const { shiftId, careRecipientName } = route.params;

  return (
    <ScrollView>
      {/* Your other shift details here */}

      <ShiftAIAnalysis
        shiftId={shiftId}
        careRecipientName={careRecipientName}
      />
    </ScrollView>
  );
};

export default ShiftDetailsScreen;
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `shiftId` | string | Yes | The ID of the shift to analyze |
| `careRecipientName` | string | No | Name of care recipient (shown in analysis) |

### Features

- On-demand analysis (user clicks "Get Suggestions")
- Displays shift summary, priorities, and suggestions
- Loading states and error handling
- Collapsible sections
- Beautiful, accessible UI

### Example in a Shift Details Screen

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import api from '../services/api';
import ShiftAIAnalysis from '../components/ShiftAIAnalysis';

const ShiftDetailsScreen = ({ route }) => {
  const { shiftId } = route.params;
  const [shift, setShift] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadShiftData();
  }, [shiftId]);

  const loadShiftData = async () => {
    const shiftData = await api.getShift(shiftId);
    const shiftNotes = await api.getShiftNotes(shiftId);
    setShift(shiftData);
    setNotes(shiftNotes);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shift Details</Text>

      {/* Display shift info */}
      <View style={styles.infoSection}>
        <Text>Date: {shift?.date}</Text>
        <Text>Shift: #{shift?.shift_number}</Text>
      </View>

      {/* Display shift notes */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Shift Notes</Text>
        {notes.map(note => (
          <View key={note.id} style={styles.note}>
            <Text>{note.content}</Text>
            <Text style={styles.noteAuthor}>{note.caregiver_name}</Text>
          </View>
        ))}
      </View>

      {/* AI Analysis Component */}
      <ShiftAIAnalysis
        shiftId={shiftId}
        careRecipientName={shift?.care_recipient_name}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  note: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ShiftDetailsScreen;
```

## Component 2: ShiftSummaryBanner

Lightweight banner that automatically loads and displays an AI summary.

### Import

```javascript
import ShiftSummaryBanner from '../components/ShiftSummaryBanner';
```

### Basic Usage

```javascript
import React from 'react';
import { View, Text } from 'react-native';
import ShiftSummaryBanner from '../components/ShiftSummaryBanner';

const ShiftListItem = ({ shift }) => {
  return (
    <View>
      <Text>Shift #{shift.shift_number}</Text>

      {/* Auto-loading summary banner */}
      <ShiftSummaryBanner shiftId={shift.id} />

      {/* Other shift info */}
    </View>
  );
};
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `shiftId` | string | Yes | The ID of the shift to summarize |

### Features

- Automatically loads on mount
- Minimal UI - just a banner
- Silently fails if API unavailable
- Perfect for shift lists or headers

### Example in a Shift List

```javascript
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';
import ShiftSummaryBanner from '../components/ShiftSummaryBanner';

const ShiftListScreen = ({ navigation }) => {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    const data = await api.getShifts();
    setShifts(data);
  };

  const renderShift = ({ item }) => (
    <TouchableOpacity
      style={styles.shiftCard}
      onPress={() => navigation.navigate('ShiftDetails', { shiftId: item.id })}
    >
      <Text style={styles.shiftTitle}>
        Shift #{item.shift_number} - {item.date}
      </Text>

      {/* AI Summary appears here automatically */}
      <ShiftSummaryBanner shiftId={item.id} />

      <Text style={styles.shiftInfo}>
        {item.recordings?.length || 0} recordings
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={shifts}
      renderItem={renderShift}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shiftCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shiftInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default ShiftListScreen;
```

## Using Both Components Together

You can use both components in the same app for different purposes:

```javascript
// In a list view - use ShiftSummaryBanner for quick overview
<ShiftSummaryBanner shiftId={shiftId} />

// In a detail view - use ShiftAIAnalysis for full analysis
<ShiftAIAnalysis shiftId={shiftId} careRecipientName={name} />
```

## Direct API Usage (Without Components)

If you want to build custom UI, use the API directly:

### Get Full Analysis

```javascript
import api from '../services/api';

const MyCustomComponent = ({ shiftId }) => {
  const [analysis, setAnalysis] = useState(null);

  const analyze = async () => {
    try {
      const result = await api.analyzeShiftNotes(shiftId);

      // result contains:
      // - summary: string
      // - suggestions: array of strings
      // - priorities: array of strings

      setAnalysis(result);

      console.log('Summary:', result.summary);
      console.log('Suggestions:', result.suggestions);
      console.log('Priorities:', result.priorities);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <Button title="Analyze" onPress={analyze} />
  );
};
```

### Get Quick Summary

```javascript
const MyComponent = ({ shiftId }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { summary } = await api.getShiftSummary(shiftId);
        setSummary(summary);
      } catch (error) {
        console.error('Failed to load summary:', error);
      }
    };

    loadSummary();
  }, [shiftId]);

  return <Text>{summary}</Text>;
};
```

## Advanced: Automatic Analysis on Shift End

Automatically analyze when a shift ends:

```javascript
const ShiftScreen = ({ shiftId }) => {
  const handleEndShift = async () => {
    try {
      // End the shift
      await api.endShift(shiftId);

      // Automatically get AI suggestions for next caregiver
      const analysis = await api.analyzeShiftNotes(shiftId);

      // Show analysis in a modal or alert
      Alert.alert(
        'Shift Ended',
        `Summary: ${analysis.summary}\n\nPriorities for next shift: ${analysis.priorities.join(', ')}`,
        [{ text: 'OK' }]
      );

      // Or navigate to a dedicated analysis screen
      navigation.navigate('ShiftAnalysis', { analysis });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Button title="End Shift" onPress={handleEndShift} />
  );
};
```

## Tips for Best Results

### 1. Write Detailed Shift Notes

The AI works best with detailed notes:
- ✅ "Patient complained of headache at 2 PM, gave ibuprofen, felt better by 3 PM"
- ❌ "Patient had headache"

### 2. When to Use Each Component

**Use ShiftAIAnalysis when:**
- Showing detailed shift information
- Caregiver needs full suggestions
- At end of shift review
- In shift handoff screens

**Use ShiftSummaryBanner when:**
- Showing lists of shifts
- Need quick context
- Space is limited
- Auto-loading is preferred

### 3. Error Handling

Both components handle errors gracefully, but you can add custom error handling:

```javascript
<ShiftAIAnalysis
  shiftId={shiftId}
  onError={(error) => {
    console.error('AI Analysis failed:', error);
    // Show custom error UI or alert
  }}
/>
```

### 4. Caching Results

To avoid redundant API calls, cache analysis results:

```javascript
const [analysisCache, setAnalysisCache] = useState({});

const getCachedAnalysis = async (shiftId) => {
  if (analysisCache[shiftId]) {
    return analysisCache[shiftId];
  }

  const analysis = await api.analyzeShiftNotes(shiftId);
  setAnalysisCache(prev => ({ ...prev, [shiftId]: analysis }));
  return analysis;
};
```

## Troubleshooting

### Component shows "AI service not available"

**Cause**: Backend not configured with Gemini API key

**Solution**:
1. Add `GEMINI_API_KEY` to `backend/.env`
2. Restart Flask server
3. See [QUICK_START_GEMINI.md](./QUICK_START_GEMINI.md)

### Summary/Analysis is empty

**Cause**: Shift has no notes

**Solution**: Ensure shift has at least 2-3 notes before analyzing

### Slow loading

**Cause**: Gemini API calls take a few seconds

**Solution**:
- Use loading indicators (both components include them)
- Consider pre-loading summaries in background
- Cache results where possible

## Next Steps

1. Add these components to your shift screens
2. Customize styling to match your app
3. Test with real shift notes
4. Gather feedback from caregivers
5. Consider additional AI features (trend analysis, alerts, etc.)

For more information:
- [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md) - Complete setup guide
- [QUICK_START_GEMINI.md](./QUICK_START_GEMINI.md) - Quick setup
