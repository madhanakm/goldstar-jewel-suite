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

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-80 sm:w-96 bg-gradient-to-b from-white to-amber-50/30 border-r border-amber-200/50 shadow-2xl z-[110] overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-yellow-500 p-4 shadow-lg z-[120]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Navigation Menu</h2>
            <Button variant="ghost" size="sm" onClick={onToggle} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4">
              <Button
                variant="ghost"
                className="w-full justify-between items-center p-3 h-auto mb-2 hover:bg-amber-100/50 rounded-xl font-semibold text-slate-700"
                onClick={() => toggleCategory(category.category)}
              >
                <span className="text-sm sm:text-base flex-1">{category.category}</span>
                  <div className="w-6 h-6 rounded-full bg-amber-200/50 flex items-center justify-center flex-shrink-0">
                  {expandedCategories.includes(category.category) ? (
                    <ChevronDown className="w-4 h-4 text-amber-700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-700" />
                  )}
                </div>
              </Button>
              
              {expandedCategories.includes(category.category) && (
                <div className="space-y-1 ml-2 border-l-2 border-amber-200/50 pl-3">
                  {category.items.map((item, index) => (
                    <div 
                      key={index}
                      className="group cursor-pointer hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-amber-200/50"
                      onClick={item.onClick}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {item.description}
                          </p>
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