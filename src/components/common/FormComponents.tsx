import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = ({ label, required, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};