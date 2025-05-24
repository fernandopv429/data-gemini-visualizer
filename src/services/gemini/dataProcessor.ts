
import { GeminiApiClient } from './apiClient';
import { DataAnalysis } from '@/utils/dataProcessor';

/**
 * Processador de dados usando Gemini AI - Versão Simplificada
 */
export class GeminiDataProcessor {
  private client: GeminiApiClient;

  constructor(apiKey: string) {
    this.client = new GeminiApiClient(apiKey);
  }

  /**
   * Limpa dados usando a API Gemini
   */
  async cleanData(data: any[]): Promise<any[]> {
    const prompt = this.createDataCleaningPrompt(data);
    
    try {
      const response = await this.client.makeRequest(prompt);
      const cleanedDataText = this.client.extractTextFromResponse(response);
      return this.client.parseJsonResponse(cleanedDataText);
    } catch (error) {
      console.warn('Erro ao limpar dados, usando dados originais');
      return data;
    }
  }

  /**
   * Analisa dados usando a API Gemini
   */
  async analyzeData(data: any[]): Promise<DataAnalysis> {
    const prompt = this.createAnalysisPrompt(data);
    
    try {
      const response = await this.client.makeRequest(prompt);
      const analysisText = this.client.extractTextFromResponse(response);
      return this.client.parseJsonResponse(analysisText);
    } catch (error) {
      console.error('Erro ao analisar dados:', error);
      throw error;
    }
  }

  /**
   * Gera resumo usando a API Gemini
   */
  async generateSummary(data: any[], analysis: DataAnalysis): Promise<string> {
    const prompt = `
Baseado nos dados analisados, crie um resumo executivo em português:

Total de registros: ${data.length}
Colunas: ${Object.keys(data[0] || {}).join(', ')}

Crie um resumo de 2-3 parágrafos explicando:
1. O que os dados representam
2. Principais insights encontrados
3. Recomendações baseadas na análise

Retorne apenas o texto do resumo.
`;
    
    try {
      const response = await this.client.makeRequest(prompt);
      return this.client.extractTextFromResponse(response);
    } catch (error) {
      return 'Resumo não disponível';
    }
  }

  private createDataCleaningPrompt(data: any[]): string {
    const sampleData = data.slice(0, 5);
    
    return `
Limpe os seguintes dados seguindo estas regras:
1. Remova espaços em branco desnecessários
2. Padronize formatos de data
3. Corrija inconsistências de capitalização
4. Converta números em string para number quando apropriado

Dados: ${JSON.stringify(sampleData, null, 2)}

Retorne APENAS um array JSON com todos os ${data.length} dados limpos, sem texto adicional.
`;
  }

  private createAnalysisPrompt(data: any[]): string {
    const sampleData = data.slice(0, 5);
    const columns = Object.keys(data[0] || {});
    
    return `
Analise os dados e retorne uma análise estruturada em JSON:

Dados (amostra): ${JSON.stringify(sampleData, null, 2)}
Total de registros: ${data.length}
Colunas: ${columns.join(', ')}

Retorne um JSON com a estrutura EXATA:
{
  "dataQuality": {
    "totalRows": ${data.length},
    "duplicates": 0,
    "missingValues": 0,
    "inconsistencies": 0
  },
  "suggestions": [
    "sugestões específicas baseadas nos dados reais"
  ],
  "recommendedCharts": [
    {
      "type": "bar",
      "reason": "motivo específico",
      "confidence": 90
    }
  ],
  "dataTypes": {
    "numeric": ["colunas numéricas"],
    "categorical": ["colunas categóricas"],
    "temporal": ["colunas temporais"]
  }
}

Analise CUIDADOSAMENTE cada coluna para classificá-las corretamente.
Retorne APENAS o JSON.
`;
  }
}
