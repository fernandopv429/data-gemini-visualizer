

import { GeminiResponse, GeminiConfig } from './types';

// Configurações da API - usando o modelo Flash 2.5
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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
    console.log('Fazendo chamada para a API Gemini Flash 2.0:', this.config.apiUrl);
    console.log('Usando API Key:', this.config.apiKey.substring(0, 10) + '...');
    
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
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API Gemini:', response.status, errorText);
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta da API Gemini recebida com sucesso');
    return data;
  }

  /**
   * Extrai o texto da resposta da API
   */
  extractTextFromResponse(response: GeminiResponse): string {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Resposta inválida da API Gemini:', response);
      throw new Error('Resposta inválida da API Gemini');
    }
    return text;
  }

  /**
   * Parse JSON da resposta, removendo formatação markdown
   */
  parseJsonResponse(text: string): any {
    try {
      // Remove formatação markdown mais agressivamente
      const jsonText = text
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim();
      
      console.log('Tentando fazer parse do JSON:', jsonText.substring(0, 200) + '...');
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Erro ao fazer parse da resposta JSON:', error);
      console.error('Texto original:', text);
      throw new Error('Erro ao fazer parse da resposta JSON');
    }
  }
}

