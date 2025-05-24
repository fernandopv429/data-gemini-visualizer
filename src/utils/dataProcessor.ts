
/**
 * Utilitários básicos para processamento de dados
 * A análise principal é feita pela IA Gemini
 */

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
 * Converte CSV para JSON
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
