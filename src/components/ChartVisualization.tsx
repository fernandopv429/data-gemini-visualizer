
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartBar, ChartLine, ChartPie, Brain } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChartVisualizationProps {
  data: any[];
  analysis: any;
  chartDescriptions?: {
    bar: string;
    line: string;
    pie: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ 
  data, 
  analysis, 
  chartDescriptions 
}) => {
  const [activeChart, setActiveChart] = useState('bar');

  // Preparar dados para visualização
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    const numericKey = keys.find(key => 
      data.every(item => !isNaN(Number(item[key])) && item[key] !== '')
    );
    const categoryKey = keys.find(key => key !== numericKey);

    if (!numericKey || !categoryKey) {
      // Dados de exemplo se não conseguir processar
      return [
        { name: 'Categoria A', value: 400 },
        { name: 'Categoria B', value: 300 },
        { name: 'Categoria C', value: 300 },
        { name: 'Categoria D', value: 200 },
      ];
    }

    // Agrupar dados por categoria
    const grouped = data.reduce((acc, item) => {
      const category = item[categoryKey];
      const value = Number(item[numericKey]) || 0;
      
      if (acc[category]) {
        acc[category] += value;
      } else {
        acc[category] = value;
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: value as number
    }));
  };

  const chartData = prepareChartData();

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }} 
        />
        <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
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
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
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

  const getChartDescription = (type: string) => {
    if (chartDescriptions && chartDescriptions[type as keyof typeof chartDescriptions]) {
      return chartDescriptions[type as keyof typeof chartDescriptions];
    }
    
    // Fallback descriptions
    switch (type) {
      case 'bar':
        return 'Ideal para comparar valores entre diferentes categorias';
      case 'line':
        return 'Perfeito para mostrar tendências e mudanças ao longo do tempo';
      case 'pie':
        return 'Excelente para mostrar a proporção de cada categoria no total';
      default:
        return 'Visualização dos dados processados';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visualização dos Dados Tratados</span>
          <div className="flex gap-2">
            {analysis?.recommendedCharts?.map((chart: any, index: number) => (
              <Badge key={index} variant="secondary">
                {chart.type} ({chart.confidence}%)
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <ChartBar className="w-4 h-4" />
              Barras
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <ChartLine className="w-4 h-4" />
              Linhas
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <ChartPie className="w-4 h-4" />
              Pizza
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Barras</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('bar')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.bar}
                  </AlertDescription>
                </Alert>
              )}
              
              {renderBarChart()}
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Linhas</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('line')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.line}
                  </AlertDescription>
                </Alert>
              )}
              
              {renderLineChart()}
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Pizza</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('pie')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.pie}
                  </AlertDescription>
                </Alert>
              )}
              
              {renderPieChart()}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
