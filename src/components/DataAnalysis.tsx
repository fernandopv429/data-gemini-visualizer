
import React, { useState } from 'react';
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { analyzeAndCleanDataWithGemini } from '@/services/geminiApi';

interface DataAnalysisProps {
  data: any[];
  onAnalysisComplete: (analysis: any, cleanedData: any[], summary: string, chartDescriptions: any) => void;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const { toast } = useToast();

  const analyzeData = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('Iniciando análise completa dos dados...');
      
      // Chama a API Gemini para análise completa
      const result = await analyzeAndCleanDataWithGemini(data);
      
      setAnalysis(result.analysis);
      setSummary(result.summary);
      
      // Passa todos os resultados para o componente pai
      onAnalysisComplete(result.analysis, result.cleanedData, result.summary, result.chartDescriptions);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados foram analisados, tratados e otimizados pela IA Gemini",
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar os dados. Verifique sua conexão e tente novamente.",
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
            Análise Inteligente com Gemini AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              A IA Gemini irá analisar, tratar e limpar seus dados, detectando inconsistências e gerando insights valiosos
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
                  Processando com Gemini AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Iniciar Análise Completa
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          {summary && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {analysis.dataQuality.missingValues} valores ausentes detectados e tratados
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
              <CardTitle>Sugestões de Melhoria Aplicadas</CardTitle>
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
