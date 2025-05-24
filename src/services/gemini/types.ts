
import { DataAnalysis } from '@/utils/dataProcessor';

/**
 * Interface para resposta da API Gemini
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Interface para dados tratados
 */
export interface ProcessedDataResponse {
  cleanedData: any[];
  analysis: DataAnalysis;
  summary: string;
  chartDescriptions: {
    bar: string;
    line: string;
    pie: string;
    scatter?: string;
  };
}

/**
 * Interface para configuração da API Gemini
 */
export interface GeminiConfig {
  apiKey: string;
  apiUrl: string;
}
