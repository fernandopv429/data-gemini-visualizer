
import { GeminiApiClient } from './apiClient';
import { DataAnalysis } from '@/utils/dataProcessor';

/**
 * Processador de dados usando Gemini AI
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
      console.warn('Erro ao limpar dados com Gemini, retornando dados originais');
      return data;
    }
  }

  /**
   * Analisa dados usando a API Gemini
   */
  async analyzeData(data: any[]): Promise<DataAnalysis> {
    const prompt = this.createDetailedAnalysisPrompt(data);
    
    try {
      const response = await this.client.makeRequest(prompt);
      const analysisText = this.client.extractTextFromResponse(response);
      const analysis = this.client.parseJsonResponse(analysisText);
      
      return this.validateAndEnhanceAnalysis(analysis, data);
    } catch (error) {
      console.error('Erro ao analisar dados:', error);
      return this.performAutomaticAnalysis(data);
    }
  }

  /**
   * Gera resumo usando a API Gemini
   */
  async generateSummary(data: any[], analysis: DataAnalysis): Promise<string> {
    const prompt = this.createSummaryPrompt(data, analysis);
    
    try {
      const response = await this.client.makeRequest(prompt);
      return this.client.extractTextFromResponse(response);
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      return 'Resumo não disponível';
    }
  }

  private createDataCleaningPrompt(data: any[]): string {
    const sampleData = data.slice(0, 10);
    const columns = Object.keys(data[0] || {});
    
    return `
Você é um especialista em limpeza de dados. Analise e limpe os seguintes dados:

Colunas: ${columns.join(', ')}
Total de registros: ${data.length}
Amostra dos dados: ${JSON.stringify(sampleData, null, 2)}

Por favor, limpe os dados seguindo estas regras:
1. Remova espaços em branco desnecessários
2. Padronize formatos de data para ISO 8601
3. Corrija inconsistências de capitalização (primeira letra maiúscula)
4. Converta números em string para number quando apropriado
5. Remova caracteres especiais desnecessários
6. Mantenha a estrutura original dos dados

Retorne APENAS um array JSON com os dados limpos, sem texto adicional ou formatação markdown.
`;
  }

  private createDetailedAnalysisPrompt(data: any[]): string {
    const sampleData = data.slice(0, 10);
    const columns = Object.keys(data[0] || {});
    
    const numericHints = columns.filter(col => 
      data.slice(0, 5).every(row => !isNaN(Number(row[col])) && row[col] !== '')
    );
    
    const dateHints = columns.filter(col =>
      data.slice(0, 5).some(row => !isNaN(Date.parse(row[col])))
    );
    
    return `
Analise os seguintes dados REAIS e retorne uma análise estruturada e precisa em JSON:

Colunas: ${columns.join(', ')}
Total de registros: ${data.length}
Colunas que parecem numéricas: ${numericHints.join(', ')}
Colunas que parecem datas: ${dateHints.join(', ')}

Amostra dos dados reais: ${JSON.stringify(sampleData, null, 2)}

IMPORTANTE: Analise os dados REAIS fornecidos, não invente informações.

Retorne um JSON com a seguinte estrutura EXATA:
{
  "dataQuality": {
    "totalRows": ${data.length},
    "duplicates": 0,
    "missingValues": 0,
    "inconsistencies": 0
  },
  "suggestions": [
    "sugestões específicas baseadas nos dados reais",
    "melhorias que podem ser aplicadas"
  ],
  "recommendedCharts": [
    {
      "type": "bar",
      "reason": "motivo específico baseado nas colunas reais",
      "confidence": 90
    }
  ],
  "dataTypes": {
    "numeric": ["colunas que contêm apenas números"],
    "categorical": ["colunas que contêm categorias/texto"],
    "temporal": ["colunas que contêm datas"]
  }
}

Analise CUIDADOSAMENTE cada coluna dos dados fornecidos para classificá-las corretamente.
Retorne APENAS o JSON, sem formatação markdown.
`;
  }

  private createSummaryPrompt(data: any[], analysis: DataAnalysis): string {
    return `
Baseado nos seguintes dados analisados, crie um resumo executivo em português:

Total de registros: ${data.length}
Colunas: ${Object.keys(data[0] || {}).join(', ')}
Qualidade dos dados: ${analysis.dataQuality.totalRows} registros, ${analysis.dataQuality.duplicates} duplicatas, ${analysis.dataQuality.missingValues} valores faltantes

Amostra dos dados: ${JSON.stringify(data.slice(0, 3), null, 2)}

Crie um resumo executivo de 2-3 parágrafos explicando:
1. O que os dados representam
2. Principais insights encontrados
3. Recomendações baseadas na análise

Retorne apenas o texto do resumo, sem formatação JSON ou markdown.
`;
  }

  private validateAndEnhanceAnalysis(analysis: any, data: any[]): DataAnalysis {
    const keys = Object.keys(data[0] || {});
    
    const autoDetectedTypes = {
      numeric: keys.filter(key => 
        data.every(item => !isNaN(Number(item[key])) && item[key] !== '' && item[key] !== null)
      ),
      categorical: keys.filter(key => 
        !keys.filter(k => data.every(item => !isNaN(Number(item[k])) && item[k] !== '' && item[k] !== null)).includes(key) &&
        !keys.filter(k => data.some(item => !isNaN(Date.parse(item[k])))).includes(key)
      ),
      temporal: keys.filter(key => 
        data.some(item => !isNaN(Date.parse(item[key])) && item[key] !== '' && item[key] !== null)
      )
    };

    return {
      dataQuality: {
        totalRows: data.length,
        duplicates: analysis.dataQuality?.duplicates || 0,
        missingValues: analysis.dataQuality?.missingValues || this.countMissingValues(data),
        inconsistencies: analysis.dataQuality?.inconsistencies || 0
      },
      suggestions: analysis.suggestions || ['Dados processados com sucesso'],
      recommendedCharts: this.generateEnhancedChartRecommendations(autoDetectedTypes, data),
      dataTypes: {
        numeric: autoDetectedTypes.numeric,
        categorical: autoDetectedTypes.categorical,
        temporal: autoDetectedTypes.temporal
      }
    };
  }

  private performAutomaticAnalysis(data: any[]): DataAnalysis {
    const keys = Object.keys(data[0] || {});
    
    const numeric = keys.filter(key => 
      data.every(item => !isNaN(Number(item[key])) && item[key] !== '' && item[key] !== null)
    );
    
    const temporal = keys.filter(key => 
      data.some(item => !isNaN(Date.parse(item[key])) && item[key] !== '' && item[key] !== null)
    );
    
    const categorical = keys.filter(key => 
      !numeric.includes(key) && !temporal.includes(key)
    );

    return {
      dataQuality: {
        totalRows: data.length,
        duplicates: 0,
        missingValues: this.countMissingValues(data),
        inconsistencies: 0
      },
      suggestions: [
        'Dados analisados automaticamente',
        `Detectadas ${numeric.length} colunas numéricas, ${categorical.length} categóricas e ${temporal.length} temporais`
      ],
      recommendedCharts: this.generateEnhancedChartRecommendations({ numeric, categorical, temporal }, data),
      dataTypes: { numeric, categorical, temporal }
    };
  }

  private generateEnhancedChartRecommendations(dataTypes: any, data: any[]) {
    const recommendations = [];
    
    if (dataTypes.categorical.length > 0 && dataTypes.numeric.length > 0) {
      recommendations.push({
        type: 'bar',
        reason: `Comparar ${dataTypes.categorical[0]} por ${dataTypes.numeric[0]}`,
        confidence: 95
      });
    }
    
    if (dataTypes.temporal.length > 0 && dataTypes.numeric.length > 0) {
      recommendations.push({
        type: 'line',
        reason: `Tendência de ${dataTypes.numeric[0]} ao longo de ${dataTypes.temporal[0]}`,
        confidence: 90
      });
    }
    
    if (dataTypes.categorical.length > 0) {
      recommendations.push({
        type: 'pie',
        reason: `Distribuição de ${dataTypes.categorical[0]}`,
        confidence: 85
      });
    }
    
    if (dataTypes.numeric.length >= 2) {
      recommendations.push({
        type: 'scatter',
        reason: `Correlação entre ${dataTypes.numeric[0]} e ${dataTypes.numeric[1]}`,
        confidence: 80
      });
    }
    
    return recommendations;
  }

  private countMissingValues(data: any[]): number {
    let missing = 0;
    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (value === '' || value === null || value === undefined) {
          missing++;
        }
      });
    });
    return missing;
  }
}
