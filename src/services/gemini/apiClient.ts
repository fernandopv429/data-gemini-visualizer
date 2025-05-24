
import { GeminiResponse, GeminiConfig } from './types';

// Configurações da API - usando o modelo correto
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Cliente base para chamadas à API Gemini
 */
export class GeminiApiClient {
  private config: GeminiConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      apiUrl: GEMINI_API_URL
    };
  }

  /**
   * Faz uma chamada à API Gemini
   */
  async makeRequest(prompt: string): Promise<GeminiResponse> {
    const response = await fetch(`${this.config.apiUrl}?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API Gemini:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Extrai o texto da resposta da API
   */
  extractTextFromResponse(response: GeminiResponse): string {
    const text = response.candidates[0]?.content?.parts[0]?.text;
    if (!text) {
      throw new Error('Resposta inválida da API Gemini');
    }
    return text;
  }

  /**
   * Parse JSON da resposta, removendo formatação markdown
   */
  parseJsonResponse(text: string): any {
    try {
      const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error) {
      throw new Error('Erro ao fazer parse da resposta JSON');
    }
  }
}
