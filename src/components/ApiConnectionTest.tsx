import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { productService } from '@/lib/productService';

interface ConnectionStatus {
  auth: boolean;
  api: boolean;
  products: number;
  error?: string;
}

export const ApiConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    auth: false,
    api: false,
    products: 0
  });
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test authentication
      const isAuth = authService.isAuthenticated();
      
      // Test API connection
      let apiConnected = false;
      let productCount = 0;
      let error = '';

      if (isAuth) {
        try {
          apiConnected = await productService.verifyConnection();
          if (apiConnected) {
            const response = await productService.getProducts(1, 1);
            productCount = response.meta?.pagination?.total || 0;
          }
        } catch (err: any) {
          error = err.message;
        }
      } else {
        error = 'Not authenticated';
      }

      setStatus({
        auth: isAuth,
        api: apiConnected,
        products: productCount,
        error: error || undefined
      });
    } catch (err: any) {
      setStatus({
        auth: false,
        api: false,
        products: 0,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          API Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Authentication</span>
            <div className="flex items-center gap-2">
              <StatusIcon success={status.auth} />
              <Badge variant={status.auth ? 'default' : 'destructive'}>
                {status.auth ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>API Connection</span>
            <div className="flex items-center gap-2">
              <StatusIcon success={status.api} />
              <Badge variant={status.api ? 'default' : 'destructive'}>
                {status.api ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Products in API</span>
            <Badge variant="outline">
              {status.products} products
            </Badge>
          </div>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>API URL:</strong> https://jewelapi.sricashway.com</p>
          <p><strong>User:</strong> {authService.getUser()?.username || 'Not logged in'}</p>
        </div>
      </CardContent>
    </Card>
  );
};