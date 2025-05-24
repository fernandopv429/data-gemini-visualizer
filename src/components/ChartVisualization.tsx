
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartBar, ChartLine, ChartPie, Brain, Scatter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChartVisualizationProps {
  data: any[];
  analysis: any;
  chartDescriptions?: {
    bar: string;
    line: string;
    pie: string;
    scatter?: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ 
  data, 
  analysis, 
  chartDescriptions 
}) => {
  const [activeChart, setActiveChart] = useState('bar');

  // Usar os dados exatos processados pela IA
  const { barData, lineData, pieData, scatterData, availableCharts } = useMemo(() => {
    if (!data || data.length === 0 || !analysis?.chartData) {
      return { barData: [], lineData: [], pieData: [], scatterData: [], availableCharts: ['bar'] };
    }
    
    // Usar os dados processados pela IA Gemini
    const chartData = analysis.chartData;
    
    return {
      barData: chartData.bar || [],
      lineData: chartData.line || [],
      pieData: chartData.pie || [],
      scatterData: chartData.scatter || [],
      availableCharts: Object.keys(chartData).filter(key => chartData[key] && chartData[key].length > 0)
    };
  }, [data, analysis]);

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }} 
        />
        <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]}>
          {barData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }} 
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#764ba2" 
          strokeWidth={3}
          dot={{ fill: '#764ba2', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" />
        <YAxis dataKey="y" type="number" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
          formatter={(value, name) => [value, name === 'x' ? 'Valor X' : 'Valor Y']}
        />
        <Scatter dataKey="y" fill="#8884d8">
          {scatterData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );

  const getDataSummary = (type: string) => {
    switch (type) {
      case 'bar':
        return `${barData.length} categorias`;
      case 'line':
        return `${lineData.length} pontos`;
      case 'pie':
        return `${pieData.length} segmentos`;
      case 'scatter':
        return `${scatterData.length} pontos`;
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Relatório Completo de Visualização</span>
          <div className="flex gap-2">
            <Badge variant="outline">{data.length} registros processados</Badge>
            <Badge variant="secondary">
              <Brain className="w-3 h-3 mr-1" />
              Análise IA
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bar" className="flex items-center gap-2" disabled={!availableCharts.includes('bar')}>
              <ChartBar className="w-4 h-4" />
              Barras
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2" disabled={!availableCharts.includes('line')}>
              <ChartLine className="w-4 h-4" />
              Linhas
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2" disabled={!availableCharts.includes('pie')}>
              <ChartPie className="w-4 h-4" />
              Pizza
            </TabsTrigger>
            <TabsTrigger value="scatter" className="flex items-center gap-2" disabled={!availableCharts.includes('scatter')}>
              <Scatter className="w-4 h-4" />
              Dispersão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ChartBar className="w-5 h-5 text-blue-600" />
                  Análise de Gráfico de Barras
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getDataSummary('bar')} analisadas pela IA Gemini
                </p>
                
                {chartDescriptions?.bar && (
                  <Alert className="mb-4">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Relatório da IA:</strong>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-line">{chartDescriptions.bar}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {barData.length > 0 ? renderBarChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  A IA não identificou dados adequados para gráfico de barras
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ChartLine className="w-5 h-5 text-green-600" />
                  Análise de Gráfico de Linhas
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getDataSummary('line')} processados pela IA
                </p>
                
                {chartDescriptions?.line && (
                  <Alert className="mb-4">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Relatório da IA:</strong>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-line">{chartDescriptions.line}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {lineData.length > 0 ? renderLineChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  A IA não identificou dados adequados para gráfico de linhas
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ChartPie className="w-5 h-5 text-orange-600" />
                  Análise de Gráfico de Pizza
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getDataSummary('pie')} categorizados pela IA
                </p>
                
                {chartDescriptions?.pie && (
                  <Alert className="mb-4">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Relatório da IA:</strong>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-line">{chartDescriptions.pie}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {pieData.length > 0 ? renderPieChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  A IA não identificou dados adequados para gráfico de pizza
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scatter" className="mt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Scatter className="w-5 h-5 text-purple-600" />
                  Análise de Gráfico de Dispersão
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getDataSummary('scatter')} correlacionados pela IA
                </p>
                
                {chartDescriptions?.scatter && (
                  <Alert className="mb-4">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Relatório da IA:</strong>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-line">{chartDescriptions.scatter}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {scatterData.length > 0 ? renderScatterChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  A IA não identificou dados adequados para gráfico de dispersão
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
