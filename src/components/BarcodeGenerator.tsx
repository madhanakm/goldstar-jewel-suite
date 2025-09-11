import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection, GradientCard } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { QrCode, Sparkles, Eye, Check, RefreshCw, Printer, AlertCircle, Package, LogOut, List, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JsBarcode from "jsbarcode";

interface BarcodeData {
  product: string;
  weight: string;
  qty: string;
  touch: string;
  making_charges_or_wastages: string;
  trayno: string;
  code: string;
}

interface Product {
  product: string;
  touch: string;
  rate: string;
  weight?: string;
}

interface BarcodeGeneratorProps extends PageProps {
  onLogout?: () => void;
}

export const BarcodeGenerator = ({ onBack, onNavigate, onLogout }: BarcodeGeneratorProps) => {
  const [formData, setFormData] = useState<BarcodeData>({
    product: "",
    weight: "",
    qty: "",
    touch: "",
    making_charges_or_wastages: "",
    trayno: "",
    code: ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trays, setTrays] = useState<any[]>([]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<any[]>([]);
  const [showBarcodeList, setShowBarcodeList] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadProducts();
    loadTrays();
    loadGeneratedBarcodes();
    generateCode();
  }, []);

  useEffect(() => {
    if (formData.code && showPreview) {
      generateBarcodePreview();
    }
    if (formData.code && isConfirmed && barcodeCanvasRef.current) {
      JsBarcode(barcodeCanvasRef.current, formData.code, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10
      });
    }
  }, [formData.code, showPreview, isConfirmed]);

  const loadProducts = async () => {
    try {
      const response = await request(endpoints.barcode.list());
      
      let productList: Product[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        productList = response.data.reduce((acc: Product[], item: any) => {
          const productName = item.attributes?.product || item.product;
          const touch = item.attributes?.touch || item.touch || '';
          const rate = item.attributes?.rate || item.rate || '0';
          
          if (productName) {
            const exists = acc.find(p => p.product === productName);
            if (!exists) {
              acc.push({ 
                product: productName, 
                touch, 
                rate, 
                weight: item.weight || item.attributes?.weight || '' 
              });
            }
          }
          return acc;
        }, []);
      }
      
      setProducts(productList);
    } catch (error) {
      toast({
        title: "⚠️ Warning",
        description: "Could not load product suggestions. You can still enter products manually.",
        variant: "destructive",
      });
    }
  };

  const loadTrays = async () => {
    try {
      const response = await request(endpoints.trays.list());
      setTrays(response.data || []);
    } catch (error) {
      console.error("Failed to load trays");
    }
  };

  const loadGeneratedBarcodes = async () => {
    try {
      const response = await request(endpoints.barcode.listBarcodes());
      setGeneratedBarcodes(response.data || []);
    } catch (error) {
      console.error("Failed to load generated barcodes");
    }
  };

  const generateCode = () => {
    const code = Math.floor(Math.random() * 90000000000000) + 10000000000000;
    setFormData(prev => ({ ...prev, code: code.toString() }));
    setIsConfirmed(false);
  };

  const generateBarcodePreview = () => {
    if (previewCanvasRef.current && formData.code) {
      try {
        JsBarcode(previewCanvasRef.current, formData.code, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode preview:', error);
      }
    }
  };

  const handleProductSearch = (value: string) => {
    setFormData(prev => ({ ...prev, product: value }));
    if (value) {
      const filtered = products.filter(p => 
        p.product.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setIsConfirmed(false);
  };

  const selectProduct = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      product: product.product,
      touch: product.touch,
      weight: product.weight || ''
    }));
    setShowSuggestions(false);
    setIsConfirmed(false);
  };

  const handlePreview = () => {
    if (!formData.product || !formData.weight || !formData.code) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in product name, weight, and ensure code is generated",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    try {
      await request(endpoints.barcode.create(), 'POST', {
        data: {
          product: formData.product,
          weight: formData.weight,
          qty: formData.qty,
          touch: formData.touch,
          making_charges_or_wastages: formData.making_charges_or_wastages,
          trayno: formData.trayno,
          code: formData.code
        }
      });
      setIsConfirmed(true);
      loadGeneratedBarcodes();
      toast({
        title: "✅ Success",
        description: "Barcode confirmed and saved to database",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to save barcode to database",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setFormData({
      product: "",
      weight: "",
      qty: "",
      touch: "",
      making_charges_or_wastages: "",
      trayno: "",
      code: ""
    });
    setShowPreview(false);
    setIsConfirmed(false);
    generateCode();
  };

  const generateBarcodeWithDetails = (product: any) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 180;
    
    if (ctx) {
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate barcode without display value
      const tempCanvas = document.createElement('canvas');
      JsBarcode(tempCanvas, product.code, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: false,
        margin: 10
      });
      
      // Add product details above barcode
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      const centerX = canvas.width / 2;
      ctx.fillText(`${product.product} - ${product.touch}`, centerX, 20);
      ctx.fillText(`Weight: ${product.weight}g • Qty: ${product.qty}`, centerX, 35);
      
      // Draw barcode centered
      const x = (canvas.width - tempCanvas.width) / 2;
      ctx.drawImage(tempCanvas, x, 40);
      
      // Add tray and VA info below barcode
      ctx.fillText(`Tray: ${product.trayno} | VA: ${product.making_charges_or_wastages}%`, centerX, 135);
      
      // Add code below everything
      ctx.fillText(product.code, centerX, 155);
    }
    
    return canvas;
  };

  const handlePrint = () => {
    if (barcodeCanvasRef.current) {
      const canvas = generateBarcodeWithDetails(formData);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Barcode</title></head>
            <body style="text-align: center; padding: 20px;">
              <img src="${canvas.toDataURL()}" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = (barcode: any) => {
    const canvas = generateBarcodeWithDetails(barcode);
    const link = document.createElement('a');
    link.download = `barcode_${barcode.code}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Barcode Generator"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Barcode Generator" }
        ]}
        icon={<QrCode className="w-6 h-6 text-primary mr-3" />}
        actions={
          <div className="flex items-center space-x-4">
            {isConfirmed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Confirmed
              </Badge>
            )}
            <ActionButton variant="outline" size="sm" onClick={() => setShowBarcodeList(true)} icon={List}>
              <span className="hidden sm:inline">View Barcodes</span>
            </ActionButton>
            {onLogout && (
              <ActionButton variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
                <span className="hidden sm:inline">Logout</span>
              </ActionButton>
            )}
          </div>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            <FormSection title="Product Information" description="Enter product details for barcode generation">
              <div className="grid grid-cols-1 gap-4">
                <FormField label="Product Name" required>
                  <div className="relative">
                    <Input
                      value={formData.product}
                      onChange={(e) => handleProductSearch(e.target.value)}
                      placeholder="Search or enter product name..."
                      className="pr-10"
                    />
                    <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {showSuggestions && filteredProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {filteredProducts.map((product, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-amber-50 cursor-pointer border-b last:border-b-0 transition-colors"
                            onClick={() => selectProduct(product)}
                          >
                            <div className="font-medium">{product.product}</div>
                            <div className="text-xs text-gray-500">Touch: {product.touch} | Weight: {product.weight}g | Rate: ₹{product.rate}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Weight (g)" required>
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </FormField>
                  <FormField label="Quantity">
                    <Input
                      value={formData.qty}
                      onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                      placeholder="0"
                      type="number"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Touch/Purity">
                    <Input
                      value={formData.touch}
                      onChange={(e) => setFormData(prev => ({ ...prev, touch: e.target.value }))}
                      placeholder="Enter touch/purity (e.g., 22K, 18K, 925)"
                    />
                  </FormField>
                  <FormField label="Tray Number">
                    <Select value={formData.trayno} onValueChange={(value) => setFormData(prev => ({ ...prev, trayno: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tray" />
                      </SelectTrigger>
                      <SelectContent>
                        {trays.map((tray) => {
                          const trayNo = tray.attributes?.trayno || tray.trayno;
                          return (
                            <SelectItem key={tray.id} value={trayNo}>
                              {trayNo}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField label="VA%">
                  <Input
                    value={formData.making_charges_or_wastages}
                    onChange={(e) => setFormData(prev => ({ ...prev, making_charges_or_wastages: e.target.value }))}
                    placeholder="Enter percentage (e.g., 5 for 5%)"
                    type="number"
                    step="0.01"
                  />
                </FormField>

                <FormField label="Barcode">
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      readOnly
                      className="bg-gray-50"
                    />
                    <ActionButton variant="outline" onClick={generateCode}>
                      <RefreshCw className="w-4 h-4" />
                    </ActionButton>
                  </div>
                </FormField>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button onClick={handlePreview} className="flex-1" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </FormSection>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {showPreview ? (
              <GradientCard 
                title="Barcode Preview" 
                description="Review before confirming"
                icon={<Sparkles className="w-5 h-5 text-white" />}
              >
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-amber-200">
                    <div className="text-center space-y-3">
                      <h3 className="font-bold text-lg text-slate-800">{formData.product} - {formData.touch}</h3>
                      <div className="flex justify-center space-x-4 text-sm text-slate-600">
                        <span>Weight: {formData.weight}g</span>
                        <span>•</span>
                        <span>Qty: {formData.qty}</span>
                      </div>
                      <canvas
                        ref={previewCanvasRef}
                        className="mx-auto border border-gray-200 rounded"
                      />
                      <div className="text-xs text-slate-500">
                        Tray: {formData.trayno} | VA: {formData.making_charges_or_wastages}%
                      </div>
                    </div>
                  </div>

                  {!isConfirmed ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Please review and confirm to save to database</span>
                      </div>
                      <Button onClick={handleConfirm} className="w-full" loading={loading}>
                        <Check className="w-4 h-4 mr-2" />
                        Confirm & Save to Database
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span>Barcode confirmed and saved successfully!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handlePrint} variant="outline" className="w-full">
                          <Printer className="w-4 h-4 mr-2" />
                          Print Label
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          New Barcode
                        </Button>
                      </div>
                      <Button onClick={handlePrint} className="w-full mt-2" size="lg">
                        <Printer className="w-5 h-5 mr-2" />
                        Print Barcode Now
                      </Button>
                    </div>
                  )}
                </div>
              </GradientCard>
            ) : (
              <GradientCard 
                title="Ready to Generate" 
                description="Fill in the form and click preview"
                icon={<QrCode className="w-5 h-5 text-white" />}
              >
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-slate-600">Complete the form and preview your barcode</p>
                </div>
              </GradientCard>
            )}
          </div>
        </div>

        {/* Hidden canvas for printing */}
        <canvas ref={barcodeCanvasRef} style={{ display: 'none' }} />

        {/* Barcode List Dialog */}
        <Dialog open={showBarcodeList} onOpenChange={setShowBarcodeList}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generated Barcodes ({generatedBarcodes.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              {generatedBarcodes.map((barcode) => (
                <Card key={barcode.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{barcode.product}</h3>
                      <div className="text-sm text-gray-600">
                        Code: {barcode.code} | Weight: {barcode.weight}g | Tray: {barcode.trayno}
                      </div>
                      <div className="text-xs text-gray-500">
                        Touch: {barcode.touch} | Qty: {barcode.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const canvas = generateBarcodeWithDetails(barcode);
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head><title>Barcode</title></head>
                              <body style="text-align: center; padding: 20px;">
                                <img src="${canvas.toDataURL()}" />
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }}>
                        <Printer className="w-3 h-3 mr-1" />
                        Print
                      </Button>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(barcode.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </PageContent>

      <SidebarWrapper
        categories={sidebarConfig}
        onNavigate={onNavigate || (() => {})}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
    </PageLayout>
  );
};