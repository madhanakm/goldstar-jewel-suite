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
import { useApi, endpoints, fetchAllPaginated, PageProps } from "@/shared";
import { QrCode, Sparkles, Eye, Check, RefreshCw, Printer, AlertCircle, Package, LogOut, List, Download, Edit, Trash2, TrendingUp } from "lucide-react";
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
  staticProduct: boolean;
  price: string;
  category: string;
}

interface Product {
  product: string;
  touch: string;
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
    code: "",
    staticProduct: false,
    price: "",
    category: ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trays, setTrays] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [showBarcodeList, setShowBarcodeList] = useState(false);
  const [editingBarcode, setEditingBarcode] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [touchFilter, setTouchFilter] = useState("all");
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdatePercentage, setBulkUpdatePercentage] = useState("");
  const [bulkUpdateCategory, setBulkUpdateCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Computed values for table
  const filteredBarcodes = generatedBarcodes.filter(barcode => {
    const matchesSearch = !searchFilter || 
      barcode.product?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      barcode.code?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "fixed" && barcode.staticProduct) ||
      (typeFilter === "weight" && !barcode.staticProduct);
    
    const matchesCategory = categoryFilter === "all" || 
      barcode.category === categoryFilter;
    
    const matchesTouch = touchFilter === "all" || 
      barcode.touch === touchFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesTouch;
  }).sort((a, b) => {
    const aIsSold = salesData.some(sale => {
      const saleAttrs = sale.attributes || sale;
      return saleAttrs.barcode && a.code && saleAttrs.barcode === a.code;
    });
    const bIsSold = salesData.some(sale => {
      const saleAttrs = sale.attributes || sale;
      return saleAttrs.barcode && b.code && saleAttrs.barcode === b.code;
    });
    
    // Available items (false) come first, sold items (true) come last
    return aIsSold - bIsSold;
  });

  const totalPages = Math.ceil(filteredBarcodes.length / pageSize);
  const paginatedBarcodes = filteredBarcodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    loadProducts();
    loadTrays();
    loadCategories();
    loadGeneratedBarcodes();
    loadSalesData();
    generateCode();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, typeFilter, categoryFilter, touchFilter, pageSize, salesData]);

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
                touch
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

  const loadCategories = async () => {
    try {
      const response = await request('/api/product-categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories");
      setCategories([]);
    }
  };

  const loadGeneratedBarcodes = async () => {
    try {
      const response = await fetchAllPaginated(request, endpoints.barcode.listBarcodes());
      const barcodes = response.data || [];
      
      // Handle both Strapi v4 format (attributes) and direct format
      const processedBarcodes = barcodes.map(barcode => {
        const barcodeData = barcode.attributes || barcode;
        return {
          ...barcodeData,
          id: barcode.id,
          documentId: barcode.documentId
        };
      });
      
      setGeneratedBarcodes(processedBarcodes);
    } catch (error) {
      console.error("Failed to load generated barcodes", error);
    }
  };

  const loadSalesData = async () => {
    try {
      const salesDetailsResponse = await fetchAllPaginated(request, endpoints.sales.details.listAll());
      const allSalesDetails = salesDetailsResponse.data || [];
      
      setSalesData(allSalesDetails);
    } catch (error) {
      console.error("Failed to load sales data");
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
      touch: product.touch
    }));
    setShowSuggestions(false);
    setIsConfirmed(false);
  };

  const handlePreview = () => {
    const requiredField = formData.staticProduct ? formData.price : formData.weight;
    const fieldName = formData.staticProduct ? 'price' : 'weight';
    
    if (!formData.product || !requiredField || !formData.code) {
      toast({
        title: "⚠️ Missing Information",
        description: `Please fill in product name, ${fieldName}, and ensure code is generated`,
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    try {
      const payload = {
        data: formData.staticProduct ? {
          product: formData.product,
          weight: formData.weight,
          qty: formData.qty,
          code: formData.code,
          staticProduct: formData.staticProduct,
          price: formData.price,
          trayno: formData.trayno,
          category: formData.category
        } : {
          product: formData.product,
          weight: formData.weight,
          qty: formData.qty,
          touch: formData.touch,
          making_charges_or_wastages: formData.making_charges_or_wastages,
          trayno: formData.trayno,
          code: formData.code,
          staticProduct: formData.staticProduct,
          category: formData.category
        }
      };
      await request(endpoints.barcode.create(), 'POST', payload);
      setIsConfirmed(true);
      loadGeneratedBarcodes();
      loadSalesData();
      toast({
        title: "✅ Success",
        description: "Barcode confirmed and saved to database",
      });
    } catch (error) {
      console.error('Barcode save error:', error);
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
      code: "",
      staticProduct: false,
      price: "",
      category: ""
    });
    setShowPreview(false);
    setIsConfirmed(false);
    generateCode();
  };

  const generateBarcodeWithDetails = (product: any) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 150;
    
    if (ctx) {
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate barcode without display value
      const tempCanvas = document.createElement('canvas');
      JsBarcode(tempCanvas, product.code, {
        format: 'CODE128',
        width: 2,
        height: 75,
        displayValue: false,
        margin: 2
      });
      
      // Add product details above barcode
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      
      const centerX = canvas.width / 2;
      
      // Truncate product name if too long
      const maxProductLength = 20;
      const productName = product.product.length > maxProductLength ? 
        product.product.substring(0, maxProductLength) + '...' : product.product;
      
      if (product.staticProduct) {
        // Fixed price product - show product name only
        ctx.font = 'bold 14px Arial';
        ctx.fillText(productName, centerX, 20);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${product.weight}g • Qty:${product.qty}`, centerX, 35);
      } else {
        // Weight-based product - show product name and touch
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${productName} - ${product.touch}`, centerX, 18);
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`${product.weight}g • Qty:${product.qty}`, centerX, 32);
      }
      
      // Draw barcode centered
      const x = (canvas.width - tempCanvas.width) / 2;
      ctx.drawImage(tempCanvas, x, 40);
      
      // Add code below barcode with some space
      ctx.font = 'bold 14px Arial';
      ctx.fillText(product.code, centerX, 130);
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
            <head>
              <title>Barcode</title>
              <style>
                @page {
                  size: 9cm 1.5cm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 9cm;
                  height: 1.5cm;
                }
                img {
                  max-width: 9cm;
                  max-height: 1.5cm;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL()}" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleRectanglePrint = () => {
    if (barcodeCanvasRef.current) {
      const canvas = generateBarcodeWithDetails(formData);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Rectangle Barcode</title>
              <style>
                @page {
                  size: 50mm 25mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 50mm;
                  height: 25mm;
                }
                img {
                  max-width: 50mm;
                  max-height: 25mm;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
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

  const handleEdit = (barcode: any) => {
    setEditingBarcode(barcode);
    setFormData({
      product: barcode.product,
      weight: barcode.weight || '',
      qty: barcode.qty,
      touch: barcode.touch || '',
      making_charges_or_wastages: barcode.making_charges_or_wastages || '',
      trayno: barcode.trayno || '',
      code: barcode.code,
      staticProduct: barcode.staticProduct || false,
      price: barcode.price || '',
      category: barcode.category || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        data: formData.staticProduct ? {
          product: formData.product,
          weight: formData.weight,
          qty: formData.qty,
          code: formData.code,
          staticProduct: formData.staticProduct,
          price: formData.price,
          trayno: formData.trayno,
          category: formData.category
        } : {
          product: formData.product,
          weight: formData.weight,
          qty: formData.qty,
          touch: formData.touch,
          making_charges_or_wastages: formData.making_charges_or_wastages,
          trayno: formData.trayno,
          code: formData.code,
          staticProduct: formData.staticProduct,
          category: formData.category
        }
      };
      
      await request(`/api/barcodes/${editingBarcode.documentId || editingBarcode.id}`, 'PUT', payload);
      setShowEditDialog(false);
      setEditingBarcode(null);
      loadGeneratedBarcodes();
      loadSalesData();
      toast({
        title: "✅ Success",
        description: "Barcode updated successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update barcode",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (barcode: any) => {
    if (!confirm('Are you sure you want to delete this barcode?')) return;
    
    try {
      await request(`/api/barcodes/${barcode.documentId || barcode.id}`, 'DELETE');
      loadGeneratedBarcodes();
      loadSalesData();
      toast({
        title: "✅ Success",
        description: "Barcode deleted successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete barcode",
        variant: "destructive",
      });
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (!bulkUpdatePercentage || isNaN(parseFloat(bulkUpdatePercentage))) {
      toast({
        title: "⚠️ Warning",
        description: "Please enter a valid percentage",
        variant: "destructive",
      });
      return;
    }

    const percentage = parseFloat(bulkUpdatePercentage);
    const fixedPriceBarcodes = generatedBarcodes.filter(barcode => {
      const isFixedPrice = barcode.staticProduct && barcode.price;
      const matchesCategory = bulkUpdateCategory === "all" || barcode.category === bulkUpdateCategory;
      return isFixedPrice && matchesCategory;
    });
    
    if (fixedPriceBarcodes.length === 0) {
      toast({
        title: "⚠️ Warning",
        description: `No fixed price products found in ${bulkUpdateCategory === "all" ? "any category" : bulkUpdateCategory + " category"} to update`,
        variant: "destructive",
      });
      return;
    }

    const categoryText = bulkUpdateCategory === "all" ? "all categories" : `${bulkUpdateCategory} category`;
    if (!confirm(`Are you sure you want to update ${fixedPriceBarcodes.length} fixed price products in ${categoryText} by ${percentage}%?`)) {
      return;
    }

    try {
      let updatedCount = 0;
      
      for (const barcode of fixedPriceBarcodes) {
        const oldPrice = parseFloat(barcode.price);
        const newPrice = oldPrice + (oldPrice * percentage / 100);
        
        const payload = {
          data: {
            product: barcode.product,
            weight: barcode.weight,
            qty: barcode.qty,
            code: barcode.code,
            staticProduct: barcode.staticProduct,
            price: newPrice.toFixed(2),
            trayno: barcode.trayno,
            category: barcode.category,
            touch: barcode.touch,
            making_charges_or_wastages: barcode.making_charges_or_wastages
          }
        };
        
        await request(`/api/barcodes/${barcode.documentId || barcode.id}`, 'PUT', payload);
        updatedCount++;
      }
      
      setShowBulkUpdateDialog(false);
      setBulkUpdatePercentage("");
      setBulkUpdateCategory("all");
      loadGeneratedBarcodes();
      
      toast({
        title: "✅ Success",
        description: `Successfully updated ${updatedCount} fixed price products`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to update prices",
        variant: "destructive",
      });
    }
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
                <FormField label="Product Type" required>
                  <Select value={formData.staticProduct ? 'static-price' : 'weight-based'} onValueChange={(value) => setFormData(prev => ({ ...prev, staticProduct: value === 'static-price' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-based">Weight-based Product</SelectItem>
                      <SelectItem value="static-price">Fixed Price Product</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
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
                              <div className="text-xs text-gray-500">Touch: {product.touch}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormField>
                  <FormField label="Category">
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Weight (g)" required>
                    <Input
                      value={formData.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          setFormData(prev => ({ ...prev, weight: value }));
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          setFormData(prev => ({ ...prev, weight: value.toFixed(2) }));
                        }
                      }}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </FormField>
                  {formData.staticProduct ? (
                    <FormField label="Price (₹)" required>
                      <Input
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                      />
                    </FormField>
                  ) : (
                    <FormField label="Quantity">
                      <Input
                        value={formData.qty}
                        onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                        placeholder="0"
                        type="number"
                      />
                    </FormField>
                  )}
                </div>
                
                {formData.staticProduct && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Quantity">
                      <Input
                        value={formData.qty}
                        onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                        placeholder="0"
                        type="number"
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
                )}

                {!formData.staticProduct && (
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
                )}

                {!formData.staticProduct && (
                  <FormField label="VA%">
                    <Input
                      value={formData.making_charges_or_wastages}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          setFormData(prev => ({ ...prev, making_charges_or_wastages: value }));
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          setFormData(prev => ({ ...prev, making_charges_or_wastages: value.toFixed(2) }));
                        }
                      }}
                      placeholder="Enter percentage (e.g., 5 for 5%)"
                      type="number"
                      step="0.01"
                    />
                  </FormField>
                )}

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
                      {formData.staticProduct ? (
                        <>
                          <h3 className="font-bold text-lg text-slate-800">{formData.product}</h3>
                          <div className="flex justify-center space-x-4 text-sm text-slate-600">
                            <span>Price: ₹{formData.price}</span>
                            <span>•</span>
                            <span>Qty: {formData.qty}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-lg text-slate-800">{formData.product} - {formData.touch}</h3>
                          <div className="flex justify-center space-x-4 text-sm text-slate-600">
                            <span>Weight: {formData.weight}g</span>
                            <span>•</span>
                            <span>Qty: {formData.qty}</span>
                          </div>
                        </>
                      )}
                      <canvas
                        ref={previewCanvasRef}
                        className="mx-auto border border-gray-200 rounded"
                      />
                      {!formData.staticProduct && (
                        <div className="text-xs text-slate-500">
                          Tray: {formData.trayno} | VA: {formData.making_charges_or_wastages}%
                        </div>
                      )}
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
                      <div className="grid grid-cols-3 gap-2">
                        <Button onClick={handlePrint} variant="outline" className="w-full">
                          <Printer className="w-4 h-4 mr-2" />
                          Fold type label
                        </Button>
                        <Button onClick={handleRectanglePrint} className="w-full" size="lg">
                          <Printer className="w-5 h-5 mr-2" />
                          Rectangle barcode
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          New Barcode
                        </Button>
                      </div>
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

        {/* Barcode Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Generated Barcodes</h2>
              <p className="text-sm text-gray-600">View and manage all generated barcodes</p>
            </div>
            <Button 
              onClick={() => setShowBulkUpdateDialog(true)} 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 border border-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <TrendingUp className="w-4 h-4" />
              Bulk Price Update
            </Button>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <FormField label="Search">
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by product name or code..."
                />
              </FormField>
              <FormField label="Product Type">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="weight">Weight Based</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Category">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Touch/Purity">
                <Select value={touchFilter} onValueChange={setTouchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All touch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Touch</SelectItem>
                    {[...new Set(generatedBarcodes.map(b => b.touch).filter(Boolean))].map((touch) => (
                      <SelectItem key={touch} value={touch}>
                        {touch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Entries per page">
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex items-end">
                <Button onClick={loadGeneratedBarcodes} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Touch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedBarcodes.map((barcode) => {
                      const isSold = salesData.some(sale => {
                        const saleAttrs = sale.attributes || sale;
                        return saleAttrs.barcode && barcode.code && saleAttrs.barcode === barcode.code;
                      });
                      
                      return (
                        <tr key={barcode.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {barcode.product}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {barcode.category || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {barcode.code}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={barcode.staticProduct ? "secondary" : "default"}>
                              {barcode.staticProduct ? "Fixed Price" : "Weight Based"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {barcode.staticProduct ? `₹${barcode.price}` : `${barcode.weight}g`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {barcode.qty}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {barcode.touch || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={isSold ? "destructive" : "default"}>
                              {isSold ? "Sold" : "Available"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(barcode)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(barcode)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                const canvas = generateBarcodeWithDetails(barcode);
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Fold Type Label</title>
                                        <style>
                                          @page {
                                            size: 9cm 1.5cm;
                                            margin: 0;
                                          }
                                          body {
                                            margin: 0;
                                            padding: 0;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            width: 9cm;
                                            height: 1.5cm;
                                          }
                                          img {
                                            max-width: 9cm;
                                            max-height: 1.5cm;
                                            object-fit: contain;
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        <img src="${canvas.toDataURL()}" />
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.print();
                                }
                              }} title="Fold type label (9cm x 1.5cm)">
                                <Printer className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="default" onClick={() => {
                                const canvas = generateBarcodeWithDetails(barcode);
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Rectangle Barcode</title>
                                        <style>
                                          @page {
                                            size: 50mm 25mm;
                                            margin: 0;
                                          }
                                          body {
                                            margin: 0;
                                            padding: 0;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            width: 50mm;
                                            height: 25mm;
                                          }
                                          img {
                                            max-width: 50mm;
                                            max-height: 25mm;
                                            object-fit: contain;
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        <img src="${canvas.toDataURL()}" />
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.print();
                                }
                              }} title="Rectangle barcode (50mm x 25mm)">
                                <Printer className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredBarcodes.length)} of {filteredBarcodes.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>

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
                        Code: {barcode.code} | {barcode.staticProduct ? `Price: ₹${barcode.price}` : `Weight: ${barcode.weight}g | Tray: ${barcode.trayno}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {barcode.staticProduct ? `Fixed Price Product` : `Touch: ${barcode.touch}`} | Qty: {barcode.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(barcode)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(barcode)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const canvas = generateBarcodeWithDetails(barcode);
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Fold Type Label</title>
                                <style>
                                  @page {
                                    size: 9cm 1.5cm;
                                    margin: 0;
                                  }
                                  body {
                                    margin: 0;
                                    padding: 0;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 9cm;
                                    height: 1.5cm;
                                  }
                                  img {
                                    max-width: 9cm;
                                    max-height: 1.5cm;
                                    object-fit: contain;
                                  }
                                </style>
                              </head>
                              <body>
                                <img src="${canvas.toDataURL()}" />
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }} title="Fold type label (9cm x 1.5cm)">
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="default" onClick={() => {
                        const canvas = generateBarcodeWithDetails(barcode);
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Rectangle Barcode</title>
                                <style>
                                  @page {
                                    size: 50mm 25mm;
                                    margin: 0;
                                  }
                                  body {
                                    margin: 0;
                                    padding: 0;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 50mm;
                                    height: 25mm;
                                  }
                                  img {
                                    max-width: 50mm;
                                    max-height: 25mm;
                                    object-fit: contain;
                                  }
                                </style>
                              </head>
                              <body>
                                <img src="${canvas.toDataURL()}" />
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }} title="Rectangle barcode (50mm x 25mm)">
                        <Printer className="w-3 h-3" />
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

        {/* Bulk Price Update Dialog */}
        <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Price Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">

              <FormField label="Category" required>
                <Select value={bulkUpdateCategory} onValueChange={setBulkUpdateCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Percentage (%)" required>
                <Input
                  value={bulkUpdatePercentage}
                  onChange={(e) => setBulkUpdatePercentage(e.target.value)}
                  placeholder="e.g., 3 for +3% or -5 for -5%"
                  type="number"
                  step="0.01"
                />
              </FormField>
              <div className="text-xs text-gray-500">
                Fixed price products in {bulkUpdateCategory === "all" ? "all categories" : bulkUpdateCategory}: {generatedBarcodes.filter(b => {
                  const isFixedPrice = b.staticProduct && b.price;
                  const matchesCategory = bulkUpdateCategory === "all" || b.category === bulkUpdateCategory;
                  return isFixedPrice && matchesCategory;
                }).length}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleBulkPriceUpdate} loading={loading} className="flex-1">
                  Update Prices
                </Button>
                <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Barcode Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Barcode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <FormField label="Product Type">
                <Select value={formData.staticProduct ? 'static-price' : 'weight-based'} onValueChange={(value) => setFormData(prev => ({ ...prev, staticProduct: value === 'static-price' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-based">Weight-based Product</SelectItem>
                    <SelectItem value="static-price">Fixed Price Product</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Product Name">
                  <Input
                    value={formData.product}
                    onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                    placeholder="Product name"
                  />
                </FormField>
                <FormField label="Category">
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {!formData.staticProduct ? (
                  <FormField label="Touch">
                    <Input
                      value={formData.touch}
                      onChange={(e) => setFormData(prev => ({ ...prev, touch: e.target.value }))}
                      placeholder="Touch/Purity"
                    />
                  </FormField>
                ) : (
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
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Weight (g)">
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Weight"
                    type="number"
                  />
                </FormField>
                {formData.staticProduct && (
                  <FormField label="Price (₹)">
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Price"
                      type="number"
                    />
                  </FormField>
                )}
                <FormField label="Quantity">
                  <Input
                    value={formData.qty}
                    onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                    placeholder="Quantity"
                    type="number"
                  />
                </FormField>
              </div>
              
              {!formData.staticProduct && (
                <div className="grid grid-cols-2 gap-4">
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
                  <FormField label="VA%">
                    <Input
                      value={formData.making_charges_or_wastages}
                      onChange={(e) => setFormData(prev => ({ ...prev, making_charges_or_wastages: e.target.value }))}
                      placeholder="VA percentage"
                      type="number"
                    />
                  </FormField>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdate} loading={loading} className="flex-1">
                  Update Barcode
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
              </div>
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