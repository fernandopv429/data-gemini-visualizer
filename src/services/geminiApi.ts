/**
 * Serviço para integração com a API Gemini do Google
 * Este módulo gerencia as chamadas para a API de IA
 */

import { DataAnalysis } from '@/utils/dataProcessor';

// Configurações da API - usando o modelo correto
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
    console.log('Amostra dos dados originais:', data.slice(0, 3));
    console.log('Colunas disponíveis:', Object.keys(data[0] || {}));
    
    // Primeiro, analisa e limpa os dados
    const cleanedData = await cleanDataWithGemini(data, apiKey);
    console.log('Dados limpos:', cleanedData.slice(0, 3));
    
    // Depois, faz a análise completa dos dados limpos
    const analysis = await analyzeDataWithGemini(cleanedData, apiKey);
    console.log('Análise completa:', analysis);
    
    // Gera resumo geral
    const summary = await generateSummaryWithGemini(cleanedData, analysis, apiKey);
    
    // Gera descrições para os gráficos com base nos dados reais
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
    // Remove markdown formatting if present
    const jsonText = cleanedDataText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Erro ao parse dos dados limpos, retornando dados originais');
    return data;
  }
};

/**
 * Analisa dados usando a API Gemini com mais detalhes
 */
const analyzeDataWithGemini = async (data: any[], apiKey: string): Promise<DataAnalysis> => {
  const prompt = createDetailedAnalysisPrompt(data);
  
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

  try {
    // Remove markdown formatting if present
    const jsonText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    // Validar e corrigir tipos de dados detectados
    const validatedAnalysis = validateAndEnhanceAnalysis(analysis, data);
    return validatedAnalysis;
  } catch (error) {
    console.error('Erro ao fazer parse da análise:', error);
    // Retorna uma análise baseada em detecção automática
    return performAutomaticAnalysis(data);
  }
};

/**
 * Valida e melhora a análise da IA
 */
const validateAndEnhanceAnalysis = (analysis: any, data: any[]): DataAnalysis => {
  const keys = Object.keys(data[0] || {});
  
  // Detectar tipos automaticamente para validação
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

  // Mesclar com a análise da IA, priorizando detecção automática
  return {
    dataQuality: {
      totalRows: data.length,
      duplicates: analysis.dataQuality?.duplicates || 0,
      missingValues: analysis.dataQuality?.missingValues || countMissingValues(data),
      inconsistencies: analysis.dataQuality?.inconsistencies || 0
    },
    suggestions: analysis.suggestions || ['Dados processados com sucesso'],
    recommendedCharts: generateEnhancedChartRecommendations(autoDetectedTypes, data),
    dataTypes: {
      numeric: autoDetectedTypes.numeric,
      categorical: autoDetectedTypes.categorical,
      temporal: autoDetectedTypes.temporal
    }
  };
};

/**
 * Análise automática quando a IA falha
 */
const performAutomaticAnalysis = (data: any[]): DataAnalysis => {
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
      missingValues: countMissingValues(data),
      inconsistencies: 0
    },
    suggestions: [
      'Dados analisados automaticamente',
      `Detectadas ${numeric.length} colunas numéricas, ${categorical.length} categóricas e ${temporal.length} temporais`
    ],
    recommendedCharts: generateEnhancedChartRecommendations({ numeric, categorical, temporal }, data),
    dataTypes: { numeric, categorical, temporal }
  };
};

/**
 * Gera recomendações melhoradas de gráficos
 */
const generateEnhancedChartRecommendations = (dataTypes: any, data: any[]) => {
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
};

/**
 * Conta valores ausentes
 */
const countMissingValues = (data: any[]): number => {
  let missing = 0;
  data.forEach(row => {
    Object.values(row).forEach(value => {
      if (value === '' || value === null || value === undefined) {
        missing++;
      }
    });
  });
  return missing;
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

Retorne apenas o texto do resumo, sem formatação JSON ou markdown.
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
 * Gera descrições para os gráficos com mais contexto
 */
const generateChartDescriptions = async (data: any[], analysis: DataAnalysis, apiKey: string): Promise<{bar: string, line: string, pie: string}> => {
  const prompt = createChartDescriptionPrompt(data, analysis);

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
    const jsonText = descriptionsText?.replace(/```json\n?|\n?```/g, '').trim() || '{}';
    return JSON.parse(jsonText);
  } catch (error) {
    return generateFallbackDescriptions(analysis);
  }
};

/**
 * Gera descrições padrão baseadas na análise
 */
const generateFallbackDescriptions = (analysis: DataAnalysis) => {
  const { numeric, categorical, temporal } = analysis.dataTypes;
  
  return {
    bar: categorical.length > 0 && numeric.length > 0 
      ? `Comparação de ${numeric[0]} entre diferentes ${categorical[0]}`
      : 'Gráfico de barras mostrando comparação entre categorias',
    line: temporal.length > 0 && numeric.length > 0
      ? `Tendência de ${numeric[0]} ao longo de ${temporal[0]}`
      : 'Gráfico de linhas mostrando evolução dos dados',
    pie: categorical.length > 0
      ? `Distribuição proporcional de ${categorical[0]}`
      : 'Gráfico de pizza mostrando distribuição proporcional'
  };
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

Retorne APENAS um array JSON com os dados limpos, sem texto adicional ou formatação markdown.
`;
};

/**
 * Cria prompt detalhado para análise de dados
 */
const createDetailedAnalysisPrompt = (data: any[]): string => {
  const sampleData = data.slice(0, 10);
  const columns = Object.keys(data[0] || {});
  
  // Analisar tipos automaticamente para dar contexto à IA
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
};

/**
 * Cria prompt para descrições de gráficos baseado nos dados reais
 */
const createChartDescriptionPrompt = (data: any[], analysis: DataAnalysis): string => {
  const { numeric, categorical, temporal } = analysis.dataTypes;
  
  return `
Baseado nos dados REAIS fornecidos, crie descrições específicas para cada tipo de gráfico:

Dados (amostra): ${JSON.stringify(data.slice(0, 5), null, 2)}
Colunas numéricas: ${numeric.join(', ')}
Colunas categóricas: ${categorical.join(', ')}
Colunas temporais: ${temporal.join(', ')}

Com base nos dados REAIS, retorne um JSON com descrições específicas:
{
  "bar": "descrição específica para gráfico de barras usando ${categorical[0] || 'categorias'} vs ${numeric[0] || 'valores'}",
  "line": "descrição específica para gráfico de linhas usando ${temporal[0] || numeric[0] || 'dados'} vs ${numeric[0] || 'valores'}", 
  "pie": "descrição específica para gráfico de pizza mostrando distribuição de ${categorical[0] || 'categorias'}"
}

As descrições devem explicar exatamente o que cada gráfico mostra com ESTES dados específicos.
Retorne APENAS o JSON, sem formatação markdown.
`;
};

export const setGeminiApiKey = (apiKey: string): void => {
  console.log('API Key configurada para Gemini');
};
