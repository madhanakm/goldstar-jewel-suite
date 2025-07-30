import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { authService } from '@/lib/auth';
import { productService } from '@/lib/productService';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

export const ProductApiDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testProduct, setTestProduct] = useState({
    name: 'Test Gold Ring',
    category: 'rings',
    weight: 5.5,
    purity: '22K',
    making_charges: 1000,
    stone_charges: 500,
    other_charges: 100,
    purchase_price: 25000,
    selling_price: 30000,
    stock_quantity: 1,
    min_stock_level: 1,
    tax_percentage: 18
  });
  const { toast } = useToast();

  const addResult = (step: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, success, message, data }]);
  };

  const runFullTest = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Step 1: Check Authentication
      const isAuth = authService.isAuthenticated();
      addResult('Authentication Check', isAuth, 
        isAuth ? 'User is authenticated' : 'User is not authenticated',
        { user: authService.getUser(), token: !!authService.getToken() }
      );

      if (!isAuth) {
        addResult('Test Stopped', false, 'Cannot proceed without authentication');
        return;
      }

      // Step 2: Test API Connection
      try {
        const connectionTest = await productService.verifyConnection();
        addResult('API Connection', connectionTest, 
          connectionTest ? 'API is reachable' : 'API connection failed'
        );

        if (!connectionTest) {
          addResult('Test Stopped', false, 'Cannot proceed without API connection');
          return;
        }
      } catch (error: any) {
        addResult('API Connection', false, `Connection error: ${error.message}`);
        return;
      }

      // Step 3: Test Fetching Existing Products
      try {
        const existingProducts = await productService.getProducts(1, 5);
        addResult('Fetch Products', true, 
          `Successfully fetched ${existingProducts.data.length} products`,
          { count: existingProducts.data.length, meta: existingProducts.meta }
        );
      } catch (error: any) {
        addResult('Fetch Products', false, `Failed to fetch products: ${error.message}`);
      }

      // Step 4: Test Product Creation
      try {
        const newProduct = await productService.createProduct(testProduct);
        addResult('Create Product', true, 
          `Product created successfully with ID: ${newProduct.id}`,
          { product: newProduct }
        );

        // Step 5: Verify Product was Created
        try {
          const createdProduct = await productService.getProduct(newProduct.id);
          addResult('Verify Creation', true, 
            `Product verified in API with SKU: ${createdProduct.sku}`,
            { product: createdProduct }
          );

          // Step 6: Test Product Update
          try {
            const updatedProduct = await productService.updateProduct(newProduct.id, {
              notes: 'Updated by API debugger'
            });
            addResult('Update Product', true, 
              'Product updated successfully',
              { product: updatedProduct }
            );
          } catch (error: any) {
            addResult('Update Product', false, `Failed to update product: ${error.message}`);
          }

          // Step 7: Clean up - Delete Test Product
          try {
            await productService.deleteProduct(newProduct.id);
            addResult('Cleanup', true, 'Test product deleted successfully');
          } catch (error: any) {
            addResult('Cleanup', false, `Failed to delete test product: ${error.message}`);
          }

        } catch (error: any) {
          addResult('Verify Creation', false, `Failed to verify product creation: ${error.message}`);
        }

      } catch (error: any) {
        addResult('Create Product', false, `Failed to create product: ${error.message}`, { error });
      }

      // Step 8: Final Product Count Check
      try {
        const finalProducts = await productService.getProducts(1, 5);
        addResult('Final Check', true, 
          `API currently has ${finalProducts.data.length} products total`,
          { count: finalProducts.data.length }
        );
      } catch (error: any) {
        addResult('Final Check', false, `Failed final check: ${error.message}`);
      }

    } catch (error: any) {
      addResult('Unexpected Error', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testDirectApiCall = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "No authentication token found",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('https://jewelapi.sricashway.com/api/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Direct API Response:', response.status, responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        toast({
          title: "Success",
          description: `Direct API call successful. Found ${data.data?.length || 0} products`,
        });
        addResult('Direct API Call', true, `Found ${data.data?.length || 0} products`, data);
      } else {
        toast({
          title: "Error",
          description: `Direct API call failed: ${response.status}`,
          variant: "destructive",
        });
        addResult('Direct API Call', false, `API returned ${response.status}: ${responseText}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      addResult('Direct API Call', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product API Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Test Product Name</Label>
              <Input
                value={testProduct.name}
                onChange={(e) => setTestProduct({...testProduct, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={testProduct.category} 
                onValueChange={(value) => setTestProduct({...testProduct, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rings">Rings</SelectItem>
                  <SelectItem value="necklaces">Necklaces</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runFullTest} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Run Full API Test
            </Button>
            <Button onClick={testDirectApiCall} disabled={loading} variant="outline">
              Test Direct API Call
            </Button>
            <Button onClick={() => setTestResults([])} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-0.5">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.step}</span>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-blue-600">
                          View Details
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Authentication:</strong> {authService.isAuthenticated() ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {authService.getUser()?.username || 'Not logged in'}
            </div>
            <div>
              <strong>API URL:</strong> https://jewelapi.sricashway.com
            </div>
            <div>
              <strong>Token:</strong> {authService.getToken() ? 'Present' : 'Missing'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};