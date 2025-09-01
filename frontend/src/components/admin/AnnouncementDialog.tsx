
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnnouncementForm, { Announcement } from '@/components/admin/AnnouncementForm';

interface AnnouncementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnnouncement: Announcement | null;
  onSuccess: () => void;
}

export function AnnouncementDialog({ 
  isOpen, 
  onOpenChange, 
  selectedAnnouncement, 
  onSuccess 
}: AnnouncementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
        </DialogHeader>
        <AnnouncementForm 
          announcement={selectedAnnouncement || undefined} 
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
