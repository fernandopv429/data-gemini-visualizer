
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartBar, ChartLine, ChartPie, Brain, Scatter as ScatterIcon } from 'lucide-react';
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

  // Usar apenas os dados processados pela IA
  const { barData, lineData, pieData, scatterData, availableCharts } = useMemo(() => {
    if (!analysis?.chartData) {
      return { barData: [], lineData: [], pieData: [], scatterData: [], availableCharts: ['bar'] };
    }
    
    const chartData = analysis.chartData;
    
    return {
      barData: chartData.bar || [],
      lineData: chartData.line || [],
      pieData: chartData.pie || [],
      scatterData: chartData.scatter || [],
      availableCharts: Object.keys(chartData).filter(key => chartData[key] && chartData[key].length > 0)
    };
  }, [analysis]);

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
        <Tooltip />
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
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
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
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" />
        <YAxis dataKey="y" type="number" />
        <Tooltip formatter={(value, name) => [value, name === 'x' ? 'Valor X' : 'Valor Y']} />
        <Scatter dataKey="y" fill="#8884d8">
          {scatterData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Relatório de Análise - Gemini AI</span>
          <Badge variant="secondary">
            <Brain className="w-3 h-3 mr-1" />
            IA Gemini
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bar" disabled={!availableCharts.includes('bar')}>
              <ChartBar className="w-4 h-4 mr-2" />
              Barras
            </TabsTrigger>
            <TabsTrigger value="line" disabled={!availableCharts.includes('line')}>
              <ChartLine className="w-4 h-4 mr-2" />
              Linhas
            </TabsTrigger>
            <TabsTrigger value="pie" disabled={!availableCharts.includes('pie')}>
              <ChartPie className="w-4 h-4 mr-2" />
              Pizza
            </TabsTrigger>
            <TabsTrigger value="scatter" disabled={!availableCharts.includes('scatter')}>
              <ScatterIcon className="w-4 h-4 mr-2" />
              Dispersão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-6">
            <div className="space-y-4">
              {chartDescriptions?.bar && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong>
                    <p className="mt-2 whitespace-pre-line">{chartDescriptions.bar}</p>
                  </AlertDescription>
                </Alert>
              )}
              {barData.length > 0 ? renderBarChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível para gráfico de barras
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <div className="space-y-4">
              {chartDescriptions?.line && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong>
                    <p className="mt-2 whitespace-pre-line">{chartDescriptions.line}</p>
                  </AlertDescription>
                </Alert>
              )}
              {lineData.length > 0 ? renderLineChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível para gráfico de linhas
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <div className="space-y-4">
              {chartDescriptions?.pie && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong>
                    <p className="mt-2 whitespace-pre-line">{chartDescriptions.pie}</p>
                  </AlertDescription>
                </Alert>
              )}
              {pieData.length > 0 ? renderPieChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível para gráfico de pizza
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scatter" className="mt-6">
            <div className="space-y-4">
              {chartDescriptions?.scatter && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong>
                    <p className="mt-2 whitespace-pre-line">{chartDescriptions.scatter}</p>
                  </AlertDescription>
                </Alert>
              )}
              {scatterData.length > 0 ? renderScatterChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível para gráfico de dispersão
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
