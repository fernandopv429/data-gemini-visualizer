
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataAnalysis } from '@/components/DataAnalysis';
import { ChartVisualization } from '@/components/ChartVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Upload, FileText } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'visualization'>('upload');
  const [data, setData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [cleanedData, setCleanedData] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [chartDescriptions, setChartDescriptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (loadedData: any[], source: 'csv' | 'sheets') => {
    console.log('Dados carregados:', loadedData);
    setData(loadedData);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (analysisResult: any, processedData: any[], summaryText: string, descriptions: any) => {
    console.log('Análise concluída:', analysisResult);
    setAnalysis(analysisResult);
    setCleanedData(processedData);
    setSummary(summaryText);
    setChartDescriptions(descriptions);
    setCurrentStep('visualization');
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      case 'visualization': return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStepStatus = (step: string) => {
    if (step === currentStep) return 'default';
    if (
      (step === 'upload') ||
      (step === 'analysis' && currentStep === 'visualization') ||
      (step === 'visualization' && currentStep === 'visualization')
    ) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-4 animate-float">
            DataViz AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme seus dados em insights visuais poderosos com a ajuda da Gemini AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          {[
            { key: 'upload', label: 'Importar Dados' },
            { key: 'analysis', label: 'Análise IA' },
            { key: 'visualization', label: 'Visualização' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <Badge 
                variant={getStepStatus(step.key) as any}
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                {getStepIcon(step.key)}
                {step.label}
              </Badge>
              {index < 2 && (
                <div className="w-8 h-0.5 bg-muted mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <div className="space-y-8">
              <FileUpload 
                onDataLoaded={handleDataLoaded} 
                isLoading={isLoading}
              />
              
              {/* Features Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Importação Fácil</h3>
                    <p className="text-sm text-muted-foreground">
                      Suporte a arquivos CSV e planilhas públicas do Google Sheets
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gemini AI</h3>
                    <p className="text-sm text-muted-foreground">
                      Análise inteligente com tratamento e correção automática dos dados
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Visualizações</h3>
                    <p className="text-sm text-muted-foreground">
                      Gráficos interativos com descrições personalizadas da IA
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 'analysis' && data.length > 0 && (
            <DataAnalysis 
              data={data}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {currentStep === 'visualization' && analysis && cleanedData.length > 0 && (
            <div className="space-y-8">
              {summary && (
                <Card className="glass-morphism">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Resumo Executivo da Análise
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

              <ChartVisualization 
                data={cleanedData}
                analysis={analysis}
                chartDescriptions={chartDescriptions}
              />
              
              {/* Summary Card */}
              <Card className="glass-morphism">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Estatísticas da Análise</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.dataQuality.totalRows}
                      </div>
                      <div className="text-sm text-muted-foreground">Registros</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {analysis.dataQuality.totalRows - analysis.dataQuality.duplicates}
                      </div>
                      <div className="text-sm text-muted-foreground">Únicos</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">
                        {analysis.recommendedCharts.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Gráficos</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">
                        {analysis.suggestions.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Melhorias</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t">
          <p className="text-muted-foreground">
            Desenvolvido com ❤️ usando React, Tailwind CSS e Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
