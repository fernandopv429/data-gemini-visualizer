/**
 * Utilitários para processamento e manipulação de dados
 * Este módulo contém funções para limpeza e transformação de dados
 */

export interface DataQuality {
  totalRows: number;
  duplicates: number;
  missingValues: number;
  inconsistencies: number;
}

export interface ChartRecommendation {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  reason: string;
  confidence: number;
}

export interface DataAnalysis {
  dataQuality: {
    totalRows: number;
    duplicates: number;
    missingValues: number;
    inconsistencies: number;
  };
  suggestions: string[];
  recommendedCharts: Array<{
    type: string;
    reason: string;
    confidence: number;
  }>;
  dataTypes: {
    numeric: string[];
    categorical: string[];
    temporal: string[];
  };
  chartData?: {
    bar: Array<{ name: string; value: number }>;
    line: Array<{ name: string; value: number }>;
    pie: Array<{ name: string; value: number }>;
    scatter: Array<{ x: number; y: number; name: string }>;
  };
}

/**
 * Converte dados CSV para formato JSON
 */
export const csvToJson = (csvText: string): any[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
};

/**
 * Detecta tipos de dados nas colunas
 */
export const detectDataTypes = (data: any[]): { numeric: string[]; categorical: string[]; temporal: string[] } => {
  if (!data || data.length === 0) {
    return { numeric: [], categorical: [], temporal: [] };
  }

  const columns = Object.keys(data[0]);
  const numeric: string[] = [];
  const categorical: string[] = [];
  const temporal: string[] = [];

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(v => v !== '');
    
    // Verificar se é numérico
    const numericValues = values.filter(v => !isNaN(Number(v)));
    if (numericValues.length > values.length * 0.8) {
      numeric.push(column);
      return;
    }

    // Verificar se é temporal
    const dateValues = values.filter(v => !isNaN(Date.parse(v)));
    if (dateValues.length > values.length * 0.8) {
      temporal.push(column);
      return;
    }

    // Caso contrário, é categórico
    categorical.push(column);
  });

  return { numeric, categorical, temporal };
};

/**
 * Limpa e padroniza dados
 */
export const cleanData = (data: any[]): any[] => {
  return data.map(row => {
    const cleanedRow: any = {};
    
    Object.keys(row).forEach(key => {
      let value = row[key];
      
      if (typeof value === 'string') {
        // Remove espaços extras e padroniza capitalização
        value = value.trim();
        
        // Se parece com um nome próprio, capitaliza
        if (value.length > 0 && /^[a-záàâãéèêíïóôõöúç\s]+$/i.test(value)) {
          value = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      
      cleanedRow[key] = value;
    });
    
    return cleanedRow;
  });
};

/**
 * Detecta duplicatas nos dados
 */
export const findDuplicates = (data: any[]): number => {
  const seen = new Set();
  let duplicates = 0;
  
  data.forEach(row => {
    const signature = JSON.stringify(row);
    if (seen.has(signature)) {
      duplicates++;
    } else {
      seen.add(signature);
    }
  });
  
  return duplicates;
};

/**
 * Conta valores ausentes
 */
export const countMissingValues = (data: any[]): number => {
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
 * Gera recomendações de gráficos baseado nos dados
 */
export const generateChartRecommendations = (data: any[]): ChartRecommendation[] => {
  const dataTypes = detectDataTypes(data);
  const recommendations: ChartRecommendation[] = [];
  
  // Gráfico de barras - bom para dados categóricos
  if (dataTypes.categorical.length > 0 && dataTypes.numeric.length > 0) {
    recommendations.push({
      type: 'bar',
      reason: 'Ideal para comparar valores entre categorias',
      confidence: 90
    });
  }
  
  // Gráfico de linhas - bom para dados temporais
  if (dataTypes.temporal.length > 0 && dataTypes.numeric.length > 0) {
    recommendations.push({
      type: 'line',
      reason: 'Perfeito para mostrar tendências ao longo do tempo',
      confidence: 95
    });
  }
  
  // Gráfico de pizza - bom para proporções
  if (dataTypes.categorical.length > 0) {
    recommendations.push({
      type: 'pie',
      reason: 'Excelente para mostrar proporções de categorias',
      confidence: 75
    });
  }
  
  // Gráfico de dispersão - bom para correlações
  if (dataTypes.numeric.length >= 2) {
    recommendations.push({
      type: 'scatter',
      reason: 'Útil para identificar correlações entre variáveis',
      confidence: 70
    });
  }
  
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};
