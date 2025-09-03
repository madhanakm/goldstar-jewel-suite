import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Plus } from "lucide-react";
import { useApi, endpoints } from "@/shared";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhar?: string;
  gstin?: string;
}

interface CustomerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onCreateNew: (name: string) => void;
  placeholder?: string;
}

export const CustomerAutocomplete = ({
  value,
  onChange,
  onCustomerSelect,
  onCreateNew,
  placeholder = "Enter customer name"
}: CustomerAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { request } = useApi();

  useEffect(() => {
    if (value.length >= 2) {
      searchCustomers(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const searchCustomers = async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await request(`/api/customers?filters[name][$containsi]=${encodeURIComponent(searchTerm)}&pagination[pageSize]=10`);
      const customers = response.data?.map((item: any) => ({
        id: item.id,
        name: item.attributes?.name || item.name,
        phone: item.attributes?.phone || item.phone,
        email: item.attributes?.email || item.email,
        address: item.attributes?.address || item.address,
        aadhar: item.attributes?.aadhar || item.aadhar,
        gstin: item.attributes?.gstin || item.gstin
      })) || [];
      
      setSuggestions(customers);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Customer search failed:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    onChange(customer.name);
    onCustomerSelect(customer);
    setShowSuggestions(false);
  };

  const handleCreateNew = () => {
    onCreateNew(value);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="pr-10"
      />
      <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
      
      {showSuggestions && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </button>
              ))}
            </div>
          ) : value.length >= 2 ? (
            <div className="p-3">
              <div className="text-gray-500 mb-2">No customers found</div>
              <Button
                onClick={handleCreateNew}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create "{value}" as new customer
              </Button>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};