export * from './api';

// Common UI Props
export interface PageProps {
  onBack: () => void;
  onNavigate?: (module: string) => void;
}

// Form States
export interface FormState<T> {
  data: T;
  loading: boolean;
  errors: Record<string, string>;
}

// List States
export interface ListState<T> {
  items: T[];
  loading: boolean;
  searchTerm: string;
  selectedItem: T | null;
}