import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, hasApiKey }) => {
  const [apiKey, setApiKey] = useState('AIzaSyAm8mkIVSDvX321s9FW6LTeMyAluMa7kjo');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar automaticamente com a nova API key
    const defaultApiKey = 'AIzaSyAm8mkIVSDvX321s9FW6LTeMyAluMa7kjo';
    localStorage.setItem('gemini_api_key', defaultApiKey);
    setIsConfigured(true);
    onApiKeySet(defaultApiKey);
    console.log('API Key configurada automaticamente:', defaultApiKey);
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma API key válida",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      toast({
        title: "Atenção",
        description: "A API key do Gemini deve começar com 'AIza'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    setIsConfigured(true);
    onApiKeySet(apiKey);
    
    toast({
      title: "API Key configurada!",
      description: "Sua API key foi salva com segurança no navegador",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsConfigured(false);
    onApiKeySet('');
    
    toast({
      title: "API Key removida",
      description: "Você precisará configurar uma nova API key",
    });
  };

  if (isConfigured) {
    return (
      <Alert className="mb-6">
        <Key className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>API Key do Gemini configurada com sucesso!</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearApiKey}
          >
            Alterar API Key
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Configurar API Key do Gemini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Para usar o sistema, você precisa inserir sua API key do Google Gemini. 
            Ela será armazenada apenas no seu navegador e não será compartilhada.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button onClick={handleSaveApiKey} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar API Key
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>Como obter sua API key:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
            <li>Faça login com sua conta Google</li>
            <li>Clique em "Create API Key"</li>
            <li>Copie e cole a chave aqui</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
