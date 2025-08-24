import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LucideIcon, Menu, X, ChevronDown, ChevronRight } from "lucide-react";

interface SidebarItem {
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  onClick: () => void;
}

interface SidebarCategory {
  category: string;
  items: SidebarItem[];
}

interface SidebarProps {
  categories: SidebarCategory[];
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ categories, isOpen, onToggle }: SidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.category));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto mb-2"
                onClick={() => toggleCategory(category.category)}
              >
                <span className="font-medium text-sm">{category.category}</span>
                {expandedCategories.includes(category.category) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              
              {expandedCategories.includes(category.category) && (
                <div className="space-y-1 mb-4">
                  {category.items.map((item, index) => (
                    <div 
                      key={index}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={item.onClick}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 ${item.color} rounded flex items-center justify-center`}>
                          <item.icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};