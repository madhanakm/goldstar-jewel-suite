import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void;
  variant?: "default" | "outline" | "destructive";
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  actions 
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column.header}</TableHead>
          ))}
          {actions && actions.length > 0 && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>
                {column.render 
                  ? column.render(item)
                  : item[column.key as keyof T]
                }
              </TableCell>
            ))}
            {actions && actions.length > 0 && (
              <TableCell>
                <div className="flex space-x-2">
                  {actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      size="sm"
                      variant={action.variant || "outline"}
                      onClick={() => action.onClick(item)}
                    >
                      {action.icon && <action.icon className="w-4 h-4" />}
                      {!action.icon && action.label}
                    </Button>
                  ))}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}