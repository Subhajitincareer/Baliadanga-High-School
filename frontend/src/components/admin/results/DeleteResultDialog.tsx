
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StudentResults } from '@/integrations/supabase/client';

interface DeleteResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResult: StudentResults | null;
  onConfirm: () => void;
}

export function DeleteResultDialog({ 
  isOpen, 
  onOpenChange, 
  selectedResult, 
  onConfirm 
}: DeleteResultDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the result for {selectedResult?.student_name} 
            in {selectedResult?.subject} ({selectedResult?.term}).
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
