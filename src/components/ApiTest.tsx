import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { authService } from '../lib/auth';
import { productApiService } from '../lib/productApiService';

export const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = () => {
    const isAuth = authService.isAuthenticated();
    const token = authService.getToken();
    const user = authService.getUser();
    
    setResult(`Auth Status: ${isAuth}\nToken: ${token ? 'Present' : 'Missing'}\nUser: ${user ? user.username : 'None'}`);
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://jewelapi.sricashway.com/api/products', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(`API Response: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProductService = async () => {
    setLoading(true);
    try {
      const products = await productApiService.getProducts();
      setResult(`Products Service: Success\nCount: ${products.data?.length || 0}\nData: ${JSON.stringify(products, null, 2)}`);
    } catch (error) {
      setResult(`Products Service Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testAuth}>Test Auth</Button>
          <Button onClick={testApiCall} disabled={loading}>Test Direct API</Button>
          <Button onClick={testProductService} disabled={loading}>Test Product Service</Button>
        </div>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {result || 'Click a button to test...'}
        </pre>
      </CardContent>
    </Card>
  );
};