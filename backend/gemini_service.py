from google import genai
import os
from typing import List, Dict

class GeminiService:
    """Service for interacting with Google Gemini API"""

    def __init__(self):
        """Initialize Gemini API with API key from environment"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not found in environment variables. "
                "Please add it to your .env file or set it as an environment variable."
            )
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.5-flash'  # Use Gemini 2.5 Flash

    def analyze_shift_notes(
        self,
        shift_notes: List[Dict],
        care_recipient_name: str = None,
        shift_context: Dict = None
    ) -> Dict:
        """
        Analyze shift notes and provide suggestions for improvement

        Args:
            shift_notes: List of shift note dictionaries with 'content', 'caregiver_name', 'timestamp'
            care_recipient_name: Optional name of care recipient
            shift_context: Optional dict with additional context (shift_number, date, etc.)

        Returns:
            Dict with 'suggestions', 'summary', and 'priorities' keys
        """
        if not shift_notes:
            return {
                'suggestions': [],
                'summary': 'No shift notes available for analysis.',
                'priorities': []
            }

        # Build the prompt for Gemini
        prompt = self._build_analysis_prompt(shift_notes, care_recipient_name, shift_context)

        try:
            # Generate response from Gemini using new SDK
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )

            # Parse the response
            result = self._parse_gemini_response(response.text)
            return result

        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return {
                'suggestions': [],
                'summary': f'Error analyzing notes: {str(e)}',
                'priorities': [],
                'error': str(e)
            }

    def _build_analysis_prompt(
        self,
        shift_notes: List[Dict],
        care_recipient_name: str,
        shift_context: Dict
    ) -> str:
        """Build a detailed prompt for Gemini to analyze shift notes"""

        # Format shift notes into readable text
        notes_text = ""
        for i, note in enumerate(shift_notes, 1):
            caregiver = note.get('caregiver_name', 'Unknown')
            content = note.get('content', '')
            timestamp = note.get('timestamp', '')
            notes_text += f"{i}. [{caregiver} at {timestamp}]: {content}\n"

        # Add context if available
        context_text = ""
        if care_recipient_name:
            context_text += f"Care Recipient: {care_recipient_name}\n"
        if shift_context:
            if shift_context.get('date'):
                context_text += f"Date: {shift_context['date']}\n"
            if shift_context.get('shift_number'):
                context_text += f"Shift Number: {shift_context['shift_number']}\n"

        prompt = f"""You are an expert healthcare assistant analyzing caregiver shift notes for elderly care.

{context_text}

SHIFT NOTES:
{notes_text}

Please analyze these shift notes and provide:

1. SUMMARY: A brief 2-3 sentence summary of the key events and observations from this shift.

2. SUGGESTIONS: 3-5 specific, actionable suggestions for the next shift to improve care quality. Focus on:
   - Follow-up actions needed based on observations
   - Patterns or concerns that need monitoring
   - Care improvements or preventive measures
   - Communication recommendations for the care team

3. PRIORITIES: Identify 2-3 top priority items that the next caregiver should focus on immediately.

Format your response EXACTLY as follows:
SUMMARY:
[Your summary here]

SUGGESTIONS:
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]
...

PRIORITIES:
- [Priority 1]
- [Priority 2]
- [Priority 3]
"""
        return prompt

    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini's structured response into a dictionary"""
        result = {
            'suggestions': [],
            'summary': '',
            'priorities': []
        }

        # Split response into sections
        lines = response_text.strip().split('\n')
        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('SUMMARY:'):
                current_section = 'summary'
                # Get summary text after "SUMMARY:"
                summary_text = line.replace('SUMMARY:', '').strip()
                if summary_text:
                    result['summary'] = summary_text
                continue
            elif line.startswith('SUGGESTIONS:'):
                current_section = 'suggestions'
                continue
            elif line.startswith('PRIORITIES:'):
                current_section = 'priorities'
                continue

            # Process content based on current section
            if current_section == 'summary' and line:
                if result['summary']:
                    result['summary'] += ' ' + line
                else:
                    result['summary'] = line
            elif current_section == 'suggestions' and line.startswith('-'):
                suggestion = line[1:].strip()
                if suggestion:
                    result['suggestions'].append(suggestion)
            elif current_section == 'priorities' and line.startswith('-'):
                priority = line[1:].strip()
                if priority:
                    result['priorities'].append(priority)

        return result

    def generate_shift_summary(self, shift_notes: List[Dict]) -> str:
        """
        Generate a concise summary of shift notes

        Args:
            shift_notes: List of shift note dictionaries

        Returns:
            String summary of the shift
        """
        if not shift_notes:
            return "No notes recorded for this shift."

        notes_text = "\n".join([
            f"- [{note.get('caregiver_name', 'Unknown')}]: {note.get('content', '')}"
            for note in shift_notes
        ])

        prompt = f"""Summarize these caregiver shift notes in 2-3 sentences:

{notes_text}

Provide a clear, concise summary focusing on the most important information."""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return f"Error generating summary: {str(e)}"
