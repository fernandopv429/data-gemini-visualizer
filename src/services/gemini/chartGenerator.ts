
import { GeminiApiClient } from './apiClient';
import { DataAnalysis } from '@/utils/dataProcessor';

/**
 * Gerador de dados para gráficos usando Gemini AI
 */
export class GeminiChartGenerator {
  private client: GeminiApiClient;

  constructor(apiKey: string) {
    this.client = new GeminiApiClient(apiKey);
  }

  /**
   * Gera dados específicos para cada tipo de gráfico
   */
  async generateChartData(data: any[], analysis: DataAnalysis): Promise<any> {
    const prompt = this.createChartDataPrompt(data, analysis);
    
    try {
      const response = await this.client.makeRequest(prompt);
      const chartDataText = this.client.extractTextFromResponse(response);
      return this.client.parseJsonResponse(chartDataText);
    } catch (error) {
      console.warn('Erro ao gerar dados dos gráficos, usando fallback');
      return this.generateFallbackChartData(data, analysis);
    }
  }

  /**
   * Gera relatórios detalhados para cada gráfico
   */
  async generateDetailedChartReports(data: any[], chartData: any): Promise<{bar: string, line: string, pie: string, scatter?: string}> {
    const prompt = this.createDetailedChartReportsPrompt(data, chartData);

    try {
      const response = await this.client.makeRequest(prompt);
      const reportsText = this.client.extractTextFromResponse(response);
      return this.client.parseJsonResponse(reportsText);
    } catch (error) {
      return this.generateFallbackReports(chartData);
    }
  }

  private createChartDataPrompt(data: any[], analysis: DataAnalysis): string {
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
  }

  private createDetailedChartReportsPrompt(data: any[], chartData: any): string {
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
  }

  private generateFallbackChartData(data: any[], analysis: DataAnalysis) {
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
    
    return result;
  }

  private generateFallbackReports(chartData: any) {
    return {
      bar: 'Gráfico de barras mostrando a distribuição dos dados por categorias principais.',
      line: 'Gráfico de linhas apresentando a evolução temporal dos valores.',
      pie: 'Gráfico de pizza demonstrando a proporção entre diferentes segmentos.',
      scatter: 'Gráfico de dispersão revelando correlações entre variáveis numéricas.'
    };
  }
}
