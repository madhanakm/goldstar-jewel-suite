import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductFormData } from '@/types/product';
import { productService } from '@/lib/productService';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  weight: z.number().min(0.01, 'Weight must be greater than 0'),
  purity: z.string().min(1, 'Purity is required'),
  making_charges: z.number().min(0, 'Making charges must be non-negative'),
  stone_charges: z.number().min(0, 'Stone charges must be non-negative').optional(),
  other_charges: z.number().min(0, 'Other charges must be non-negative').optional(),
  stock_quantity: z.number().min(0, 'Stock quantity must be non-negative'),
  min_stock_level: z.number().min(0, 'Minimum stock level must be non-negative'),
  supplier: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().min(0, 'Purchase price must be non-negative'),
  selling_price: z.number().min(0, 'Selling price must be non-negative'),
  discount_percentage: z.number().min(0).max(100, 'Discount must be between 0-100').optional(),
  tax_percentage: z.number().min(0).max(100, 'Tax must be between 0-100'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      weight: product.weight,
      purity: product.purity,
      making_charges: product.making_charges,
      stone_charges: product.stone_charges || 0,
      other_charges: product.other_charges || 0,
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      supplier: product.supplier || '',
      purchase_date: product.purchase_date || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      discount_percentage: product.discount_percentage || 0,
      tax_percentage: product.tax_percentage,
      location: product.location || '',
      notes: product.notes || '',
    } : {
      stone_charges: 0,
      other_charges: 0,
      discount_percentage: 0,
      tax_percentage: 18,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Verify API connection first
      const isConnected = await productService.verifyConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to API. Please check your connection and authentication.');
      }

      let result;
      if (product) {
        result = await productService.updateProduct(product.id, data);
        toast({
          title: "Success",
          description: `Product "${result.name}" updated successfully`,
        });
      } else {
        result = await productService.createProduct(data);
        toast({
          title: "Success",
          description: `Product "${result.name}" created successfully with SKU: ${result.sku}`,
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Product save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                onValueChange={(value) => setValue('category', value)}
                defaultValue={product?.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rings">Rings</SelectItem>
                  <SelectItem value="necklaces">Necklaces</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                  <SelectItem value="bracelets">Bracelets</SelectItem>
                  <SelectItem value="bangles">Bangles</SelectItem>
                  <SelectItem value="chains">Chains</SelectItem>
                  <SelectItem value="pendants">Pendants</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                {...register('subcategory')}
                placeholder="Enter subcategory"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Properties */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Physical Properties</h3>
            
            <div>
              <Label htmlFor="weight">Weight (grams) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                {...register('weight', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.weight && <p className="text-sm text-red-500">{errors.weight.message}</p>}
            </div>

            <div>
              <Label htmlFor="purity">Purity *</Label>
              <Select 
                onValueChange={(value) => setValue('purity', value)}
                defaultValue={product?.purity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24K">24K</SelectItem>
                  <SelectItem value="22K">22K</SelectItem>
                  <SelectItem value="18K">18K</SelectItem>
                  <SelectItem value="14K">14K</SelectItem>
                  <SelectItem value="916">916</SelectItem>
                  <SelectItem value="750">750</SelectItem>
                </SelectContent>
              </Select>
              {errors.purity && <p className="text-sm text-red-500">{errors.purity.message}</p>}
            </div>

            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter storage location"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            
            <div>
              <Label htmlFor="purchase_price">Purchase Price (₹) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                {...register('purchase_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price.message}</p>}
            </div>

            <div>
              <Label htmlFor="making_charges">Making Charges (₹) *</Label>
              <Input
                id="making_charges"
                type="number"
                step="0.01"
                {...register('making_charges', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.making_charges && <p className="text-sm text-red-500">{errors.making_charges.message}</p>}
            </div>

            <div>
              <Label htmlFor="stone_charges">Stone Charges (₹)</Label>
              <Input
                id="stone_charges"
                type="number"
                step="0.01"
                {...register('stone_charges', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="other_charges">Other Charges (₹)</Label>
              <Input
                id="other_charges"
                type="number"
                step="0.01"
                {...register('other_charges', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="selling_price">Selling Price (₹) *</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                {...register('selling_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price.message}</p>}
            </div>

            <div>
              <Label htmlFor="tax_percentage">Tax Percentage (%) *</Label>
              <Input
                id="tax_percentage"
                type="number"
                step="0.01"
                {...register('tax_percentage', { valueAsNumber: true })}
                placeholder="18.00"
              />
              {errors.tax_percentage && <p className="text-sm text-red-500">{errors.tax_percentage.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Inventory</h3>
            
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...register('stock_quantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stock_quantity && <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>}
            </div>

            <div>
              <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
              <Input
                id="min_stock_level"
                type="number"
                {...register('min_stock_level', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.min_stock_level && <p className="text-sm text-red-500">{errors.min_stock_level.message}</p>}
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                {...register('purchase_date')}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};