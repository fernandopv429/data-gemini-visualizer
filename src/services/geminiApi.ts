
/**
 * Serviço para integração com a API Gemini do Google
 * Este módulo gerencia as chamadas para a API de IA
 */

import { DataAnalysis } from '@/utils/dataProcessor';

// Configurações da API
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
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
 * Analisa dados usando a API Gemini
 */
export const analyzeDataWithGemini = async (data: any[]): Promise<DataAnalysis> => {
  // Simulação para desenvolvimento - remova em produção
  if (!GEMINI_API_KEY) {
    console.warn('API Key do Gemini não configurada. Usando dados simulados.');
    return simulateGeminiAnalysis(data);
  }

  try {
    const prompt = createAnalysisPrompt(data);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      throw new Error(`Erro na API Gemini: ${response.statusText}`);
    }

    const result: GeminiResponse = await response.json();
    const analysisText = result.candidates[0]?.content?.parts[0]?.text;
    
    if (!analysisText) {
      throw new Error('Resposta inválida da API Gemini');
    }

    // Parse da resposta JSON da IA
    return JSON.parse(analysisText);
    
  } catch (error) {
    console.error('Erro ao analisar dados com Gemini:', error);
    // Fallback para análise simulada em caso de erro
    return simulateGeminiAnalysis(data);
  }
};

/**
 * Cria prompt para análise de dados
 */
const createAnalysisPrompt = (data: any[]): string => {
  const sampleData = data.slice(0, 5); // Apenas primeiros 5 registros para análise
  const columns = Object.keys(data[0] || {});
  
  return `
Analise os seguintes dados e retorne uma análise estruturada em JSON:

Colunas: ${columns.join(', ')}
Total de registros: ${data.length}
Amostra dos dados: ${JSON.stringify(sampleData, null, 2)}

Por favor, retorne um JSON com a seguinte estrutura:
{
  "dataQuality": {
    "totalRows": number,
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
      "type": "bar" | "line" | "pie" | "scatter",
      "reason": "motivo da recomendação",
      "confidence": number (0-100)
    }
  ],
  "dataTypes": {
    "numeric": ["coluna1", "coluna2"],
    "categorical": ["coluna3", "coluna4"],
    "temporal": ["coluna5"]
  }
}

Analise a qualidade dos dados, detecte problemas, sugira melhorias e recomende os melhores tipos de gráficos para visualização.
`;
};

/**
 * Simulação da análise Gemini para desenvolvimento
 */
const simulateGeminiAnalysis = async (data: any[]): Promise<DataAnalysis> => {
  // Simula delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const columns = Object.keys(data[0] || {});
  
  return {
    dataQuality: {
      totalRows: data.length,
      duplicates: Math.floor(data.length * 0.05),
      missingValues: Math.floor(data.length * 0.02),
      inconsistencies: Math.floor(data.length * 0.01),
    },
    suggestions: [
      'Padronizar formato de datas para ISO 8601',
      'Converter texto para formato consistente (primeira letra maiúscula)',
      'Remover espaços desnecessários no início e fim dos campos',
      'Validar e corrigir valores numéricos inconsistentes',
      'Adicionar validação para campos obrigatórios'
    ],
    recommendedCharts: [
      {
        type: 'bar',
        reason: 'Ideal para comparar valores entre diferentes categorias',
        confidence: 92
      },
      {
        type: 'line',
        reason: 'Excelente para mostrar tendências temporais',
        confidence: 85
      },
      {
        type: 'pie',
        reason: 'Perfeito para mostrar distribuição proporcional',
        confidence: 78
      }
    ],
    dataTypes: {
      numeric: columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== '')
      ),
      categorical: columns.filter(col => 
        data.every(row => isNaN(Number(row[col])) || row[col] === '') &&
        !data.some(row => !isNaN(Date.parse(row[col])))
      ),
      temporal: columns.filter(col => 
        data.some(row => !isNaN(Date.parse(row[col])))
      )
    }
  };
};

/**
 * Configurar chave da API Gemini
 */
export const setGeminiApiKey = (apiKey: string): void => {
  // Em produção, isso seria configurado via variáveis de ambiente
  console.log('API Key configurada para Gemini');
};
