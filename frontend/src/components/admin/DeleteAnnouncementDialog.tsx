
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Announcement } from '@/components/admin/AnnouncementForm';

interface DeleteAnnouncementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnnouncement: Announcement | null;
  onConfirm: () => void;
}

export function DeleteAnnouncementDialog({ 
  isOpen, 
  onOpenChange, 
  selectedAnnouncement, 
  onConfirm 
}: DeleteAnnouncementDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the announcement "{selectedAnnouncement?.title}".
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
