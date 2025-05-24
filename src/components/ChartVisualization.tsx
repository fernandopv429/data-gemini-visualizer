
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartBar, ChartLine, ChartPie, Brain, Scatter3D } from 'lucide-react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ 
  data, 
  analysis, 
  chartDescriptions 
}) => {
  const [activeChart, setActiveChart] = useState('bar');

  // Função para detectar automaticamente as melhores colunas para cada tipo de gráfico
  const { barData, lineData, pieData, scatterData, availableCharts } = useMemo(() => {
    if (!data || data.length === 0) return { barData: [], lineData: [], pieData: [], scatterData: [], availableCharts: ['bar'] };
    
    const keys = Object.keys(data[0]);
    const numericColumns = analysis?.dataTypes?.numeric || [];
    const categoricalColumns = analysis?.dataTypes?.categorical || [];
    const temporalColumns = analysis?.dataTypes?.temporal || [];
    
    console.log('Colunas detectadas:', { numericColumns, categoricalColumns, temporalColumns });
    console.log('Dados originais:', data.slice(0, 3));

    // Detectar colunas automaticamente se a análise não forneceu
    const autoNumericColumns = keys.filter(key => 
      data.every(item => !isNaN(Number(item[key])) && item[key] !== '' && item[key] !== null)
    );
    const autoCategoricalColumns = keys.filter(key => 
      !autoNumericColumns.includes(key) && 
      !temporalColumns.includes(key)
    );

    const finalNumericColumns = numericColumns.length > 0 ? numericColumns : autoNumericColumns;
    const finalCategoricalColumns = categoricalColumns.length > 0 ? categoricalColumns : autoCategoricalColumns;

    console.log('Colunas finais:', { finalNumericColumns, finalCategoricalColumns });

    // Preparar dados para gráfico de barras
    let barChartData = [];
    if (finalCategoricalColumns.length > 0 && finalNumericColumns.length > 0) {
      const categoryCol = finalCategoricalColumns[0];
      const valueCol = finalNumericColumns[0];
      
      const grouped = data.reduce((acc, item) => {
        const category = String(item[categoryCol] || 'Sem categoria');
        const value = Number(item[valueCol]) || 0;
        
        if (acc[category]) {
          acc[category] += value;
        } else {
          acc[category] = value;
        }
        return acc;
      }, {});

      barChartData = Object.entries(grouped)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Limitar a 10 categorias para melhor visualização
    }

    // Preparar dados para gráfico de linhas (temporal ou sequencial)
    let lineChartData = [];
    if (temporalColumns.length > 0 && finalNumericColumns.length > 0) {
      const timeCol = temporalColumns[0];
      const valueCol = finalNumericColumns[0];
      
      lineChartData = data
        .map(item => ({
          name: String(item[timeCol]),
          value: Number(item[valueCol]) || 0,
          date: new Date(item[timeCol])
        }))
        .filter(item => !isNaN(item.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({ name: item.name, value: item.value }));
    } else if (finalCategoricalColumns.length > 0 && finalNumericColumns.length > 0) {
      // Usar dados categóricos como linha temporal se não houver dados temporais
      lineChartData = barChartData;
    }

    // Preparar dados para gráfico de pizza
    let pieChartData = [];
    if (finalCategoricalColumns.length > 0) {
      const categoryCol = finalCategoricalColumns[0];
      const valueCol = finalNumericColumns[0];
      
      if (valueCol) {
        // Usar valores numéricos se disponível
        const grouped = data.reduce((acc, item) => {
          const category = String(item[categoryCol] || 'Outros');
          const value = Number(item[valueCol]) || 0;
          
          if (acc[category]) {
            acc[category] += value;
          } else {
            acc[category] = value;
          }
          return acc;
        }, {});

        pieChartData = Object.entries(grouped)
          .map(([name, value]) => ({ name, value: value as number }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Limitar a 8 fatias para melhor visualização
      } else {
        // Contar frequência se não há valores numéricos
        const counts = data.reduce((acc, item) => {
          const category = String(item[categoryCol] || 'Outros');
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        pieChartData = Object.entries(counts)
          .map(([name, value]) => ({ name, value: value as number }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
      }
    }

    // Preparar dados para gráfico de dispersão
    let scatterChartData = [];
    if (finalNumericColumns.length >= 2) {
      const xCol = finalNumericColumns[0];
      const yCol = finalNumericColumns[1];
      
      scatterChartData = data
        .map(item => ({
          x: Number(item[xCol]) || 0,
          y: Number(item[yCol]) || 0,
          name: String(item[finalCategoricalColumns[0]] || 'Item')
        }))
        .filter(item => !isNaN(item.x) && !isNaN(item.y));
    }

    // Determinar quais gráficos estão disponíveis
    const charts = ['bar'];
    if (lineChartData.length > 0) charts.push('line');
    if (pieChartData.length > 0) charts.push('pie');
    if (scatterChartData.length > 0) charts.push('scatter');

    console.log('Dados preparados:', { barChartData, lineChartData, pieChartData, scatterChartData });

    return {
      barData: barChartData,
      lineData: lineChartData,
      pieData: pieChartData,
      scatterData: scatterChartData,
      availableCharts: charts
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

  const getChartDescription = (type: string) => {
    if (chartDescriptions && chartDescriptions[type as keyof typeof chartDescriptions]) {
      return chartDescriptions[type as keyof typeof chartDescriptions];
    }
    
    // Descrições mais específicas baseadas nos dados
    switch (type) {
      case 'bar':
        return `Comparação entre as ${barData.length} principais categorias dos seus dados`;
      case 'line':
        return `Tendência dos valores ao longo de ${lineData.length} pontos de dados`;
      case 'pie':
        return `Distribuição proporcional entre ${pieData.length} categorias`;
      case 'scatter':
        return `Correlação entre duas variáveis numéricas com ${scatterData.length} pontos`;
      default:
        return 'Visualização dos dados processados';
    }
  };

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
          <span>Visualização Detalhada dos Dados</span>
          <div className="flex gap-2">
            <Badge variant="outline">{data.length} registros</Badge>
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
              <Scatter3D className="w-4 h-4" />
              Dispersão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Barras</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('bar')} - {getDataSummary('bar')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions?.bar && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.bar}
                  </AlertDescription>
                </Alert>
              )}
              
              {barData.length > 0 ? renderBarChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Dados insuficientes para gráfico de barras
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Linhas</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('line')} - {getDataSummary('line')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions?.line && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.line}
                  </AlertDescription>
                </Alert>
              )}
              
              {lineData.length > 0 ? renderLineChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Dados insuficientes para gráfico de linhas
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Pizza</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('pie')} - {getDataSummary('pie')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {chartDescriptions?.pie && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Análise da IA:</strong> {chartDescriptions.pie}
                  </AlertDescription>
                </Alert>
              )}
              
              {pieData.length > 0 ? renderPieChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Dados insuficientes para gráfico de pizza
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scatter" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Gráfico de Dispersão</h3>
                  <p className="text-sm text-muted-foreground">
                    {getChartDescription('scatter')} - {getDataSummary('scatter')}
                  </p>
                </div>
                {chartDescriptions && (
                  <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
              
              {scatterData.length > 0 ? renderScatterChart() : (
                <div className="text-center py-8 text-muted-foreground">
                  Dados insuficientes para gráfico de dispersão (necessário pelo menos 2 colunas numéricas)
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
