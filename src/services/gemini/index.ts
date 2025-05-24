
import { GeminiDataProcessor } from './dataProcessor';
import { GeminiChartGenerator } from './chartGenerator';
import { ProcessedDataResponse } from './types';

/**
 * Analisa e trata dados usando a API Gemini
 */
export const analyzeAndCleanDataWithGemini = async (data: any[], apiKey: string): Promise<ProcessedDataResponse> => {
  if (!apiKey) {
    throw new Error('API Key do Gemini não configurada');
  }

  try {
    console.log('Iniciando análise completa dos dados com Gemini...');
    console.log('Amostra dos dados originais:', data.slice(0, 3));
    console.log('Colunas disponíveis:', Object.keys(data[0] || {}));
    
    const dataProcessor = new GeminiDataProcessor(apiKey);
    const chartGenerator = new GeminiChartGenerator(apiKey);
    
    // Primeiro, analisa e limpa os dados
    const cleanedData = await dataProcessor.cleanData(data);
    console.log('Dados limpos:', cleanedData.slice(0, 3));
    
    // Depois, faz a análise completa dos dados limpos
    const analysis = await dataProcessor.analyzeData(cleanedData);
    console.log('Análise completa:', analysis);
    
    // Gera os dados específicos para cada gráfico
    const chartData = await chartGenerator.generateChartData(cleanedData, analysis);
    analysis.chartData = chartData;
    
    // Gera resumo geral
    const summary = await dataProcessor.generateSummary(cleanedData, analysis);
    
    // Gera relatórios detalhados para cada gráfico
    const chartDescriptions = await chartGenerator.generateDetailedChartReports(cleanedData, chartData);
    
    return {
      cleanedData,
      analysis,
      summary,
      chartDescriptions
    };
    
  } catch (error) {
    console.error('Erro ao processar dados com Gemini:', error);
    throw error;
  }
};

export const setGeminiApiKey = (apiKey: string): void => {
  console.log('API Key configurada para Gemini');
};

// Re-export types for convenience
export type { ProcessedDataResponse, GeminiResponse } from './types';
