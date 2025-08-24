import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradientCard } from "./GradientCard";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  className
}: DataGridProps<T>) {
  if (loading) {
    return (
      <GradientCard className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600">Loading data...</span>
          </div>
        </div>
      </GradientCard>
    );
  }

  if (data.length === 0) {
    return (
      <GradientCard className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full" />
            </div>
            <p className="text-slate-600">{emptyMessage}</p>
          </div>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard className={className}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-amber-200/50">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={cn("font-semibold text-slate-700", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="border-amber-200/30 hover:bg-amber-50/30 transition-colors">
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.className}>
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </GradientCard>
  );
}