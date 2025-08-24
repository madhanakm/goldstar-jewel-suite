import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }[];
}

export const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  filters = []
}: SearchFilterProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="md:col-span-2"
          />
          {filters.map((filter, index) => (
            <Select key={index} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};