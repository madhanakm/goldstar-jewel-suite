import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { productService } from '@/lib/productService';

interface ApiStatus {
  authenticated: boolean;
  apiConnected: boolean;
  productCount: number;
  lastChecked: Date;
  error?: string;
}

export const ApiStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>({
    authenticated: false,
    apiConnected: false,
    productCount: 0,
    lastChecked: new Date()
  });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const authenticated = authService.isAuthenticated();
      let apiConnected = false;
      let productCount = 0;
      let error: string | undefined;

      if (authenticated) {
        try {
          apiConnected = await productService.verifyConnection();
          if (apiConnected) {
            const response = await productService.getProducts(1, 1);
            productCount = response.meta?.pagination?.total || 0;
          }
        } catch (err: any) {
          error = err.message;
          apiConnected = false;
        }
      }

      setStatus({
        authenticated,
        apiConnected,
        productCount,
        lastChecked: new Date(),
        error
      });
    } catch (err: any) {
      setStatus(prev => ({
        ...prev,
        error: err.message,
        lastChecked: new Date()
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authentication</span>
            <Badge variant={status.authenticated ? 'default' : 'destructive'}>
              {status.authenticated ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {status.authenticated ? 'Connected' : 'Not authenticated'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">API Connection</span>
            <Badge variant={status.apiConnected ? 'default' : 'destructive'}>
              {status.apiConnected ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {status.apiConnected ? 'Connected' : 'Failed'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Products in API</span>
            <Badge variant="outline">
              {status.productCount} products
            </Badge>
          </div>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <p><strong>User:</strong> {authService.getUser()?.username || 'Not logged in'}</p>
            <p><strong>API URL:</strong> https://jewelapi.sricashway.com</p>
            <p><strong>Last checked:</strong> {status.lastChecked.toLocaleTimeString()}</p>
          </div>
          
          <Button 
            onClick={checkStatus} 
            disabled={loading} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};