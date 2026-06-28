const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async generateSuggestion(title, description) {
    if (!this.apiKey) {
      return this.getFallbackSuggestion();
    }

    const prompt = `
      You are a task estimation assistant. Based on the task details below, provide:
      1. Estimated effort in hours (as a number)
      2. Suggested due date (as a number of days from today)
      3. Brief reasoning (max 100 words)

      Task Title: ${title}
      Task Description: ${description || 'No description provided'}

      Return ONLY valid JSON in this exact format:
      {
        "effort": number,
        "dueDateInDays": number,
        "reasoning": "string"
      }
    `;

    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return this.getFallbackSuggestion();
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getFallbackSuggestion();
      }

      const suggestion = JSON.parse(jsonMatch[0]);
      
      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (suggestion.dueDateInDays || 3));

      return {
        effort: Math.round(suggestion.effort || 3),
        dueDate: dueDate.toISOString().split('T')[0],
        reasoning: suggestion.reasoning || 'Based on the task complexity and scope.',
        success: true,
      };
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return this.getFallbackSuggestion();
    }
  }

  getFallbackSuggestion() {
    return {
      effort: 3,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reasoning: 'Based on similar tasks, this typically takes 3-5 hours.',
      success: false,
      fallback: true,
    };
  }
}

module.exports = new GeminiService();