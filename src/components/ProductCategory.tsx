import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageLayout, PageContent, PageHeader, useSidebar, SidebarWrapper, ActionButton, FormField, FormSection } from "@/components/common";
import { sidebarConfig } from "@/lib/sidebarConfig";
import { useApi, endpoints, PageProps } from "@/shared";
import { Package, Plus, Edit, Trash2, LogOut, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  documentId?: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface ProductCategoryProps extends PageProps {
  onLogout?: () => void;
}

export const ProductCategory = ({ onBack, onNavigate, onLogout }: ProductCategoryProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const { loading, request } = useApi();

  const totalPages = Math.ceil(categories.length / pageSize);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await request('/api/product-categories');
      setCategories(response.data || []);
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
      setCategories([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "⚠️ Warning",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = { data: formData };
      
      if (editingCategory) {
        await request(`/api/product-categories/${editingCategory.documentId || editingCategory.id}`, 'PUT', payload);
        toast({
          title: "✅ Success",
          description: "Category updated successfully",
        });
      } else {
        await request('/api/product-categories', 'POST', payload);
        toast({
          title: "✅ Success",
          description: "Category created successfully",
        });
      }
      
      setShowDialog(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
      loadCategories();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await request(`/api/product-categories/${category.documentId || category.id}`, 'DELETE');
      toast({
        title: "✅ Success",
        description: "Category deleted successfully",
      });
      loadCategories();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowDialog(true);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Product Categories"
        onMenuClick={toggleSidebar}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => onNavigate?.("Dashboard") },
          { label: "Product Categories" }
        ]}
        icon={<Package className="w-6 h-6 text-primary mr-3" />}
        actions={
          <div className="flex items-center space-x-4">
            {onLogout && (
              <ActionButton variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
                <span className="hidden sm:inline">Logout</span>
              </ActionButton>
            )}
          </div>
        }
      />

      <PageContent>
        <FormSection title="Categories" description="Manage product categories for better organization">
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <ActionButton variant="primary" onClick={handleNewCategory} icon={Plus}>
                Add Category
              </ActionButton>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button onClick={loadCategories} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge variant="secondary">{category.name}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {category.description || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(category)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, categories.length)} of {categories.length} entries
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
            )}
          </div>
        </FormSection>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <FormField label="Category Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </FormField>
              <FormField label="Description">
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description (optional)"
                />
              </FormField>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} loading={loading} className="flex-1">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
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