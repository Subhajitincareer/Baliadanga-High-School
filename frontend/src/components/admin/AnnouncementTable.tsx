import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { Announcement } from '@/services/api';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementTableProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

// ─── UTILITIES (Outside component to prevent re-instantiation) ─────────────
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ─── SUB-COMPONENTS (DRY Principle) ──────────────────────────────────────────

const CategoryBadge = ({ category }: { category: string }) => {
  const styles = category === "Event" 
    ? "bg-blue-100 text-blue-800" 
    : "bg-amber-100 text-amber-800";
    
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {category}
    </span>
  );
};

interface DownloadButtonProps {
  announcement: Announcement;
  isDownloading: boolean;
  onDownload: (announcement: Announcement) => void;
  size?: 'sm' | 'xs';
}

const DownloadButton = ({ announcement, isDownloading, onDownload, size = 'sm' }: DownloadButtonProps) => {
  if (!announcement.pdfFile && !announcement.pdf_url && (!announcement.attachments || announcement.attachments.length === 0)) {
    return <span className="text-xs text-muted-foreground italic">No PDF</span>;
  }

  const isMobile = size === 'xs';

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isDownloading}
      onClick={(e) => {
        e.preventDefault();
        onDownload(announcement);
      }}
      className={`flex h-8 items-center text-blue-600 hover:text-blue-800 p-0 hover:bg-transparent ${isMobile ? 'h-6' : ''}`}
    >
      {isDownloading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <FileText className={`mr-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
      <span className="text-xs">
        {isDownloading ? (isMobile ? '...' : 'Downloading...') : (isMobile ? 'PDF' : 'Download')}
      </span>
    </Button>
  );
};

const ActionButtons = ({ 
  announcement, 
  onEdit, 
  onDelete,
  variant = 'default' 
}: { 
  announcement: Announcement; 
  onEdit: (a: Announcement) => void; 
  onDelete: (a: Announcement) => void;
  variant?: 'default' | 'icon-only';
}) => {
  const isIconOnly = variant === 'icon-only';
  
  return (
    <div className={`flex items-center ${isIconOnly ? 'space-x-1' : 'justify-end space-x-2'}`}>
      <Button
        variant={isIconOnly ? "ghost" : "outline"}
        size={isIconOnly ? "icon" : "sm"}
        className={isIconOnly ? "h-8 w-8" : ""}
        onClick={() => onEdit(announcement)}
        title="Edit Announcement"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant={isIconOnly ? "ghost" : "outline"}
        size={isIconOnly ? "icon" : "sm"}
        className={`${isIconOnly ? "h-8 w-8" : ""} text-destructive hover:bg-destructive/10 hover:text-destructive`}
        onClick={() => onDelete(announcement)}
        title="Delete Announcement"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export const AnnouncementTable: React.FC<AnnouncementTableProps> = ({
  announcements,
  onEdit,
  onDelete,
}) => {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (announcement: Announcement) => {
    if (!announcement._id) return;

    try {
      setDownloadingId(announcement._id);
      
      const full = await apiService.getAnnouncementById(announcement._id);
      
      // Prioritized extraction with safety checks
      let pdfData = full.pdfFile?.data;
      
      if (!pdfData && full.pdf_url) {
        try {
          const parsed = typeof full.pdf_url === 'string' ? JSON.parse(full.pdf_url) : full.pdf_url;
          pdfData = (parsed as any).data || (typeof full.pdf_url === 'string' ? full.pdf_url : (full.pdf_url as any).data);
        } catch (e) {
          pdfData = typeof full.pdf_url === 'string' ? full.pdf_url : (full.pdf_url as any).data;
        }
      }
      
      if (!pdfData && (full.attachments?.length ?? 0) > 0) {
        pdfData = full.attachments![0].url;
      }

      if (!pdfData) {
        throw new Error('No PDF document data found for this announcement.');
      }

      // Modern download approach: Open in new tab (safest for cross-origin/blobs)
      window.open(pdfData, '_blank');
      
    } catch (err: any) {
      console.error('Download error:', err);
      toast({ 
        title: 'Download Failed', 
        description: err.message || 'Failed to retrieve the document.', 
        variant: 'destructive' 
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50/50">
        <p className="text-center text-sm text-muted-foreground">
          No announcements available. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden rounded-md border border-slate-200 md:block">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Title</TableHead>
              <TableHead className="font-semibold text-slate-700">Category</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">PDF</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement._id || `fallback-${announcement.title}`} className="hover:bg-slate-50/30 transition-colors">
                <TableCell className="font-medium text-slate-900">{announcement.title}</TableCell>
                <TableCell>
                  <CategoryBadge category={announcement.category} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDate(announcement.publishDate)}
                </TableCell>
                <TableCell>
                  <DownloadButton 
                    announcement={announcement} 
                    isDownloading={downloadingId === announcement._id}
                    onDownload={handleDownload}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <ActionButtons 
                    announcement={announcement}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {announcements.map((announcement) => (
          <div key={announcement._id || `mob-${announcement.title}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors">
            <div className="mb-2 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 leading-tight">{announcement.title}</h3>
                <CategoryBadge category={announcement.category} />
              </div>
              <ActionButtons 
                announcement={announcement}
                onEdit={onEdit}
                onDelete={onDelete}
                variant="icon-only"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatDate(announcement.publishDate)}
              </span>
              <DownloadButton 
                announcement={announcement} 
                isDownloading={downloadingId === announcement._id}
                onDownload={handleDownload}
                size="xs"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
