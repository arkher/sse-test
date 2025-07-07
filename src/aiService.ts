import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // ou seu domínio real
    "X-Title": "SSE Chat App"
  }
});

const SYSTEM_PROMPT = process.env.AI_SYSTEM_PROMPT || 
  "You are a helpful medical assistant. Respond to patient questions in a professional, caring, and informative manner. Keep responses concise but helpful.";

export interface AIResponse {
  message: string;
  success: boolean;
  error?: string;
}

export class AIService {
  private conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

  async generateResponse(userMessage: string): Promise<AIResponse> {
    try {
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "org-your-openrouter-key-here") {
        return {
          message: "I'm sorry, but I'm not properly configured to respond right now. Please check the API configuration.",
          success: false,
          error: "API key not configured"
        };
      }

      // Add user message to conversation history
      this.conversationHistory.push({ role: "user", content: userMessage });

      // Prepare messages for OpenRouter API
      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || "deepseek-chat",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      // Add AI response to conversation history
      this.conversationHistory.push({ role: "assistant", content: aiResponse });

      return {
        message: aiResponse,
        success: true
      };

    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        message: "I'm sorry, I'm experiencing technical difficulties right now. Please try again later.",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): Array<{ role: "user" | "assistant"; content: string }> {
    return [...this.conversationHistory];
  }
}

// Singleton instance
export const aiService = new AIService(); 