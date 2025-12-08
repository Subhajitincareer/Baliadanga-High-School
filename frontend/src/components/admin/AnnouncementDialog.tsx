
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription>
            {selectedAnnouncement ? 'Modify the details of the existing announcement below.' : 'Fill in the form below to create a new announcement.'}
          </DialogDescription>
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
