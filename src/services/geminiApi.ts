/**
 * Serviço para integração com a API Gemini do Google
 * Este módulo gerencia as chamadas para a API de IA
 */

import { DataAnalysis } from '@/utils/dataProcessor';

// Configurações da API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Interface para resposta da API Gemini
 */
interface GeminiResponse {
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
interface ProcessedDataResponse {
  cleanedData: any[];
  analysis: DataAnalysis;
  summary: string;
  chartDescriptions: {
    bar: string;
    line: string;
    pie: string;
  };
}

/**
 * Analisa e trata dados usando a API Gemini
 */
export const analyzeAndCleanDataWithGemini = async (data: any[], apiKey: string): Promise<ProcessedDataResponse> => {
  if (!apiKey) {
    throw new Error('API Key do Gemini não configurada');
  }

  try {
    console.log('Iniciando análise e tratamento dos dados com Gemini...');
    
    // Primeiro, analisa e limpa os dados
    const cleanedData = await cleanDataWithGemini(data, apiKey);
    
    // Depois, faz a análise completa dos dados limpos
    const analysis = await analyzeDataWithGemini(cleanedData, apiKey);
    
    // Gera resumo geral
    const summary = await generateSummaryWithGemini(cleanedData, analysis, apiKey);
    
    // Gera descrições para os gráficos
    const chartDescriptions = await generateChartDescriptions(cleanedData, analysis, apiKey);
    
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

/**
 * Limpa e trata os dados usando a API Gemini
 */
const cleanDataWithGemini = async (data: any[], apiKey: string): Promise<any[]> => {
  const prompt = createDataCleaningPrompt(data);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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

  const result: GeminiResponse = await response.json();
  const cleanedDataText = result.candidates[0]?.content?.parts[0]?.text;
  
  if (!cleanedDataText) {
    throw new Error('Resposta inválida da API Gemini para limpeza de dados');
  }

  try {
    return JSON.parse(cleanedDataText);
  } catch (error) {
    console.warn('Erro ao parse dos dados limpos, retornando dados originais');
    return data;
  }
};

/**
 * Analisa dados usando a API Gemini
 */
const analyzeDataWithGemini = async (data: any[], apiKey: string): Promise<DataAnalysis> => {
  const prompt = createAnalysisPrompt(data);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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

  const result: GeminiResponse = await response.json();
  const analysisText = result.candidates[0]?.content?.parts[0]?.text;
  
  if (!analysisText) {
    throw new Error('Resposta inválida da API Gemini');
  }

  return JSON.parse(analysisText);
};

/**
 * Gera resumo geral dos dados
 */
const generateSummaryWithGemini = async (data: any[], analysis: DataAnalysis, apiKey: string): Promise<string> => {
  const prompt = `
Baseado nos seguintes dados analisados, crie um resumo executivo em português:

Total de registros: ${data.length}
Colunas: ${Object.keys(data[0] || {}).join(', ')}
Qualidade dos dados: ${analysis.dataQuality.totalRows} registros, ${analysis.dataQuality.duplicates} duplicatas, ${analysis.dataQuality.missingValues} valores faltantes

Amostra dos dados: ${JSON.stringify(data.slice(0, 3), null, 2)}

Crie um resumo executivo de 2-3 parágrafos explicando:
1. O que os dados representam
2. Principais insights encontrados
3. Recomendações baseadas na análise

Retorne apenas o texto do resumo, sem formatação JSON.
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
    console.error('Erro na API Gemini para resumo:', response.status, errorText);
    throw new Error(`Erro na API Gemini para resumo: ${response.status} ${response.statusText}`);
  }

  const result: GeminiResponse = await response.json();
  return result.candidates[0]?.content?.parts[0]?.text || 'Resumo não disponível';
};

/**
 * Gera descrições para os gráficos
 */
const generateChartDescriptions = async (data: any[], analysis: DataAnalysis, apiKey: string): Promise<{bar: string, line: string, pie: string}> => {
  const prompt = `
Baseado nos dados fornecidos, crie descrições específicas para cada tipo de gráfico em português:

Dados: ${JSON.stringify(data.slice(0, 5), null, 2)}
Colunas numéricas: ${analysis.dataTypes.numeric.join(', ')}
Colunas categóricas: ${analysis.dataTypes.categorical.join(', ')}

Retorne um JSON com as seguintes chaves:
{
  "bar": "descrição específica para gráfico de barras (1-2 frases)",
  "line": "descrição específica para gráfico de linhas (1-2 frases)", 
  "pie": "descrição específica para gráfico de pizza (1-2 frases)"
}

As descrições devem explicar o que cada gráfico mostra especificamente com estes dados.
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
    console.error('Erro na API Gemini para descrições:', response.status, errorText);
    throw new Error(`Erro na API Gemini para descrições: ${response.status} ${response.statusText}`);
  }

  const result: GeminiResponse = await response.json();
  const descriptionsText = result.candidates[0]?.content?.parts[0]?.text;
  
  try {
    return JSON.parse(descriptionsText || '{}');
  } catch (error) {
    return {
      bar: 'Gráfico de barras mostrando comparação entre categorias',
      line: 'Gráfico de linhas mostrando tendências ao longo do tempo',
      pie: 'Gráfico de pizza mostrando distribuição proporcional'
    };
  }
};

/**
 * Cria prompt para limpeza de dados
 */
const createDataCleaningPrompt = (data: any[]): string => {
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

Retorne APENAS um array JSON com os dados limpos, sem texto adicional.
`;
};

/**
 * Cria prompt para análise de dados
 */
const createAnalysisPrompt = (data: any[]): string => {
  const sampleData = data.slice(0, 5);
  const columns = Object.keys(data[0] || {});
  
  return `
Analise os seguintes dados limpos e retorne uma análise estruturada em JSON:

Colunas: ${columns.join(', ')}
Total de registros: ${data.length}
Amostra dos dados: ${JSON.stringify(sampleData, null, 2)}

Retorne um JSON com a seguinte estrutura EXATA:
{
  "dataQuality": {
    "totalRows": ${data.length},
    "duplicates": number,
    "missingValues": number,
    "inconsistencies": number
  },
  "suggestions": [
    "sugestão 1",
    "sugestão 2"
  ],
  "recommendedCharts": [
    {
      "type": "bar",
      "reason": "motivo da recomendação",
      "confidence": number
    }
  ],
  "dataTypes": {
    "numeric": ["coluna1"],
    "categorical": ["coluna2"],
    "temporal": ["coluna3"]
  }
}

Analise a qualidade dos dados, detecte problemas, sugira melhorias e recomende os melhores tipos de gráficos.
`;
};

export const setGeminiApiKey = (apiKey: string): void => {
  console.log('API Key configurada para Gemini');
};
