import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface DataListProps<T> {
  title: string;
  icon?: ReactNode;
  data: T[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onAdd?: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  addButtonText?: string;
}

export function DataList<T>({
  title,
  icon,
  data,
  loading,
  searchValue,
  onSearchChange,
  onScroll,
  onAdd,
  renderItem,
  addButtonText = 'Add New',
}: DataListProps<T>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {onAdd && (
            <Button variant="success" onClick={onAdd} className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>{addButtonText}</span>
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[calc(100vh-320px)] overflow-y-auto" onScroll={onScroll}>
          <div className="space-y-2 p-4">
            {data.map((item, index) => renderItem(item, index))}
            
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}