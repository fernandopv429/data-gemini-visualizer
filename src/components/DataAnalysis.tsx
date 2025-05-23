
import React, { useState } from 'react';
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface DataAnalysisProps {
  data: any[];
  onAnalysisComplete: (analysis: any, cleanedData: any[]) => void;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeData = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análise com Gemini API
      // Em uma implementação real, você faria uma requisição para a API Gemini
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        dataQuality: {
          totalRows: data.length,
          duplicates: Math.floor(data.length * 0.1),
          missingValues: Math.floor(data.length * 0.05),
          inconsistencies: Math.floor(data.length * 0.03),
        },
        suggestions: [
          'Converter campos de data para formato ISO',
          'Padronizar nomes de cidades (capitalização)',
          'Remover espaços extras nos campos de texto',
          'Validar e corrigir valores numéricos inconsistentes'
        ],
        recommendedCharts: [
          { type: 'bar', reason: 'Ideal para comparar categorias de dados', confidence: 95 },
          { type: 'line', reason: 'Mostra tendências ao longo do tempo', confidence: 80 },
          { type: 'pie', reason: 'Representa distribuição de categorias', confidence: 75 }
        ],
        dataTypes: {
          numeric: ['idade', 'valor', 'quantidade'],
          categorical: ['cidade', 'categoria', 'status'],
          temporal: ['data', 'timestamp']
        }
      };

      // Simular dados limpos
      const cleanedData = data.map(row => {
        const cleaned = { ...row };
        // Simular limpeza de dados
        Object.keys(cleaned).forEach(key => {
          if (typeof cleaned[key] === 'string') {
            cleaned[key] = cleaned[key].trim();
          }
        });
        return cleaned;
      });

      setAnalysis(mockAnalysis);
      onAnalysisComplete(mockAnalysis, cleanedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados foram analisados e otimizados pela IA",
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Análise Inteligente de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Nossa IA irá analisar seus dados, detectar inconsistências e sugerir melhorias
            </p>
            <Button 
              onClick={analyzeData}
              disabled={isAnalyzing}
              className="animate-pulse-glow"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Iniciar Análise
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Qualidade dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {analysis.dataQuality.totalRows}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Registros</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {analysis.dataQuality.duplicates}
                  </div>
                  <div className="text-sm text-muted-foreground">Duplicatas</div>
                </div>
              </div>
              
              {analysis.dataQuality.missingValues > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {analysis.dataQuality.missingValues} valores ausentes detectados
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Gráficos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.recommendedCharts.map((chart: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      {chart.type.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{chart.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {chart.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confiança</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sugestões de Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
