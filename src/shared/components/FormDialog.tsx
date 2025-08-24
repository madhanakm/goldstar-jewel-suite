import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FormDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
  submitText?: string;
  loading?: boolean;
}

export function FormDialog({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitText = 'Submit',
  loading = false,
}: FormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {children}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="success" onClick={onSubmit} disabled={loading}>
              {loading ? 'Loading...' : submitText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}