
import React, { useState } from 'react';
import { Brain, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeAndCleanDataWithGemini } from '@/services/geminiApi';

interface DataAnalysisProps {
  data: any[];
  apiKey: string;
  onAnalysisComplete: (analysis: any, cleanedData: any[], summary: string, chartDescriptions: any) => void;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ data, apiKey, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeData = async () => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Configure sua API key do Gemini primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Iniciando análise completa com IA Gemini...');
      
      const result = await analyzeAndCleanDataWithGemini(data, apiKey);
      
      onAnalysisComplete(result.analysis, result.cleanedData, result.summary, result.chartDescriptions);
      
      toast({
        title: "Análise concluída!",
        description: "Dados analisados e processados pela IA Gemini",
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Verifique sua API key e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Análise Inteligente com Gemini AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              A IA Gemini irá analisar seus dados e gerar insights completos
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>📊 {data.length} registros</span>
              <span>🧠 Análise completa</span>
              <span>📈 Gráficos otimizados</span>
            </div>
          </div>
          
          <Button 
            onClick={analyzeData}
            disabled={isAnalyzing || !apiKey}
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
                Iniciar Análise IA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
