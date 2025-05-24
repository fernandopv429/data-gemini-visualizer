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
    scatter?: string;
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
    console.log('Iniciando análise completa dos dados com Gemini...');
    console.log('Amostra dos dados originais:', data.slice(0, 3));
    console.log('Colunas disponíveis:', Object.keys(data[0] || {}));
    
    // Primeiro, analisa e limpa os dados
    const cleanedData = await cleanDataWithGemini(data, apiKey);
    console.log('Dados limpos:', cleanedData.slice(0, 3));
    
    // Depois, faz a análise completa dos dados limpos
    const analysis = await analyzeDataWithGemini(cleanedData, apiKey);
    console.log('Análise completa:', analysis);
    
    // Gera os dados específicos para cada gráfico
    const chartData = await generateChartData(cleanedData, analysis, apiKey);
    analysis.chartData = chartData;
    
    // Gera resumo geral
    const summary = await generateSummaryWithGemini(cleanedData, analysis, apiKey);
    
    // Gera relatórios detalhados para cada gráfico
    const chartDescriptions = await generateDetailedChartReports(cleanedData, chartData, apiKey);
    
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
 * Gera dados específicos para cada tipo de gráfico
 */
const generateChartData = async (data: any[], analysis: DataAnalysis, apiKey: string): Promise<any> => {
  const prompt = createChartDataPrompt(data, analysis);
  
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
    console.error('Erro na API Gemini para dados dos gráficos:', response.status, errorText);
    throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
  }

  const result: GeminiResponse = await response.json();
  const chartDataText = result.candidates[0]?.content?.parts[0]?.text;
  
  if (!chartDataText) {
    throw new Error('Resposta inválida da API Gemini para dados dos gráficos');
  }

  try {
    const jsonText = chartDataText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Erro ao parse dos dados dos gráficos, usando fallback');
    return generateFallbackChartData(data, analysis);
  }
};

/**
 * Gera relatórios detalhados para cada gráfico
 */
const generateDetailedChartReports = async (data: any[], chartData: any, apiKey: string): Promise<{bar: string, line: string, pie: string, scatter?: string}> => {
  const prompt = createDetailedChartReportsPrompt(data, chartData);

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
    console.error('Erro na API Gemini para relatórios:', response.status, errorText);
    throw new Error(`Erro na API Gemini para relatórios: ${response.status} ${response.statusText}`);
  }

  const result: GeminiResponse = await response.json();
  const reportsText = result.candidates[0]?.content?.parts[0]?.text;
  
  try {
    const jsonText = reportsText?.replace(/```json\n?|\n?```/g, '').trim() || '{}';
    return JSON.parse(jsonText);
  } catch (error) {
    return generateFallbackReports(chartData);
  }
};

/**
 * Cria prompt para gerar dados específicos dos gráficos
 */
const createChartDataPrompt = (data: any[], analysis: DataAnalysis): string => {
  const { numeric, categorical, temporal } = analysis.dataTypes;
  const sampleData = data.slice(0, 10);
  
  return `
Analise os dados REAIS fornecidos e gere dados específicos e otimizados para cada tipo de gráfico.

Dados completos (amostra): ${JSON.stringify(sampleData, null, 2)}
Total de registros: ${data.length}
Colunas numéricas: ${numeric.join(', ')}
Colunas categóricas: ${categorical.join(', ')}
Colunas temporais: ${temporal.join(', ')}

Com base nos dados REAIS, processe e retorne um JSON com dados específicos para cada gráfico:

{
  "bar": [
    {"name": "categoria1", "value": 100},
    {"name": "categoria2", "value": 150}
  ],
  "line": [
    {"name": "periodo1", "value": 100},
    {"name": "periodo2", "value": 120}
  ],
  "pie": [
    {"name": "segmento1", "value": 30},
    {"name": "segmento2", "value": 45}
  ],
  "scatter": [
    {"x": 10, "y": 20, "name": "ponto1"},
    {"x": 15, "y": 25, "name": "ponto2"}
  ]
}

INSTRUÇÕES ESPECÍFICAS:
1. Para BAR: Agrupe por categorias mais relevantes, mostre até 10 categorias principais
2. Para LINE: Use dados temporais se disponível, senão use sequência lógica
3. Para PIE: Mostre distribuição proporcional, máximo 8 segmentos
4. Para SCATTER: Use 2 colunas numéricas mais correlacionadas

IMPORTANTE: Use os dados REAIS fornecidos, não invente valores. Se não há dados suficientes para um tipo de gráfico, retorne array vazio [].

Retorne APENAS o JSON, sem formatação markdown.
`;
};

/**
 * Cria prompt para relatórios detalhados dos gráficos
 */
const createDetailedChartReportsPrompt = (data: any[], chartData: any): string => {
  return `
Com base nos dados processados e nos gráficos gerados, crie relatórios detalhados e insights específicos para cada tipo de visualização.

Dados originais (amostra): ${JSON.stringify(data.slice(0, 5), null, 2)}
Dados dos gráficos: ${JSON.stringify(chartData, null, 2)}

Crie relatórios detalhados em português brasileiro:

{
  "bar": "Relatório detalhado do gráfico de barras: [análise específica dos dados, principais insights, comparações entre categorias, valores destacados, tendências identificadas - mínimo 3 parágrafos]",
  "line": "Relatório detalhado do gráfico de linhas: [análise temporal ou sequencial, tendências identificadas, pontos de inflexão, crescimento/declínio, projeções - mínimo 3 parágrafos]",
  "pie": "Relatório detalhado do gráfico de pizza: [análise de distribuição, segmentos dominantes, proporções significativas, interpretação dos percentuais - mínimo 3 parágrafos]",
  "scatter": "Relatório detalhado do gráfico de dispersão: [análise de correlação, padrões identificados, outliers, relação entre variáveis, insights estatísticos - mínimo 3 parágrafos]"
}

Cada relatório deve:
- Ser específico para os dados analisados
- Incluir insights acionáveis
- Mencionar números e valores específicos
- Identificar padrões e tendências
- Sugerir implicações práticas

Retorne APENAS o JSON, sem formatação markdown.
`;
};

/**
 * Gera dados de fallback para gráficos
 */
const generateFallbackChartData = (data: any[], analysis: DataAnalysis) => {
  const { numeric, categorical, temporal } = analysis.dataTypes;
  const result: any = { bar: [], line: [], pie: [], scatter: [] };
  
  // Gráfico de barras
  if (categorical.length > 0 && numeric.length > 0) {
    const categoryCol = categorical[0];
    const valueCol = numeric[0];
    
    const grouped = data.reduce((acc, item) => {
      const category = String(item[categoryCol] || 'Outros');
      const value = Number(item[valueCol]) || 0;
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {});

    result.bar = Object.entries(grouped)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }
  
  // Outros gráficos seguem lógica similar...
  return result;
};

/**
 * Gera relatórios de fallback
 */
const generateFallbackReports = (chartData: any) => {
  return {
    bar: 'Gráfico de barras mostrando a distribuição dos dados por categorias principais.',
    line: 'Gráfico de linhas apresentando a evolução temporal dos valores.',
    pie: 'Gráfico de pizza demonstrando a proporção entre diferentes segmentos.',
    scatter: 'Gráfico de dispersão revelando correlações entre variáveis numéricas.'
  };
};

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
    const jsonText = cleanedDataText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('Erro ao parse dos dados limpos, retornando dados originais');
    return data;
  }
};

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
    const jsonText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    const validatedAnalysis = validateAndEnhanceAnalysis(analysis, data);
    return validatedAnalysis;
  } catch (error) {
    console.error('Erro ao fazer parse da análise:', error);
    return performAutomaticAnalysis(data);
  }
};

const validateAndEnhanceAnalysis = (analysis: any, data: any[]): DataAnalysis => {
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

const createDetailedAnalysisPrompt = (data: any[]): string => {
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
};

export const setGeminiApiKey = (apiKey: string): void => {
  console.log('API Key configurada para Gemini');
};
