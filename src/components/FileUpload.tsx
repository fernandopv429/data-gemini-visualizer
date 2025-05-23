
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onDataLoaded: (data: any[], source: 'csv' | 'sheets') => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        
        onDataLoaded(data, 'csv');
        toast({
          title: "Arquivo carregado com sucesso!",
          description: `${data.length} registros encontrados`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos CSV",
        variant: "destructive",
      });
    }
  }, [onDataLoaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleSheetsUrl = async () => {
    if (!sheetsUrl) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira a URL da planilha do Google Sheets",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simular busca de dados do Google Sheets
      // Em uma implementação real, você faria uma requisição para a API do Google Sheets
      const mockData = [
        { nome: 'João', idade: 25, cidade: 'São Paulo' },
        { nome: 'Maria', idade: 30, cidade: 'Rio de Janeiro' },
        { nome: 'Pedro', idade: 35, cidade: 'Belo Horizonte' },
      ];
      
      onDataLoaded(mockData, 'sheets');
      toast({
        title: "Dados carregados do Google Sheets!",
        description: `${mockData.length} registros encontrados`,
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique se a URL está correta e se a planilha é pública",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">
            Importar Dados
          </h2>
          <p className="text-muted-foreground">
            Faça upload de um arquivo CSV ou conecte uma planilha do Google Sheets
          </p>
        </div>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Arquivo CSV
            </TabsTrigger>
            <TabsTrigger value="sheets" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Google Sheets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="mt-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-300 hover:bg-muted/50
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                ${isLoading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-muted-foreground animate-float" />
                )}
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo CSV aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para selecionar um arquivo
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sheets" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  URL da Planilha Pública do Google Sheets
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSheetsUrl} 
                className="w-full"
                disabled={isLoading || !sheetsUrl}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Carregar Dados
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
