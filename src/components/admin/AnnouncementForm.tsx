import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'Event' | 'Notice';
  date: string;
  pdfFile?: {
    name: string;
    data: string;
  };
}

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ announcement, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [type, setType] = useState<'Event' | 'Notice'>(announcement?.type || 'Notice');
  const [date, setDate] = useState<Date>(announcement?.date ? new Date(announcement.date) : new Date());
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState(announcement?.pdfFile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setExistingPdf(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let pdfData = existingPdf;

      if (pdfFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(pdfFile);
        });

        pdfData = {
          name: pdfFile.name,
          data: base64
        };
      }

      const formattedDate = format(date, 'yyyy-MM-dd');

      const announcementData = {
        title,
        content,
        type,
        date: formattedDate,
        pdf_url: pdfData ? JSON.stringify(pdfData) : null
      };

      if (announcement?.id) {
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", announcement.id);

        if (error) throw error;

        toast({
          title: 'Announcement updated',
          description: 'The announcement has been updated successfully.'
        });
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert([announcementData]);

        if (error) throw error;

        toast({
          title: 'Announcement created',
          description: 'The announcement has been created successfully.'
        });
      }

      const storedAnnouncements = localStorage.getItem('announcements');
      const announcements = storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
      
      if (announcement?.id) {
        const index = announcements.findIndex((a: Announcement) => a.id === announcement.id);
        if (index !== -1) {
          announcements[index] = { ...announcements[index], ...announcementData, pdfFile: pdfData };
          localStorage.setItem('announcements', JSON.stringify(announcements));
        }
      } else {
        const newId = crypto.randomUUID();
        const newAnnouncement = { 
          id: newId, 
          ...announcementData, 
          pdfFile: pdfData 
        };
        announcements.push(newAnnouncement);
        localStorage.setItem('announcements', JSON.stringify(announcements));
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the announcement.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as 'Event' | 'Notice')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Event">Event</SelectItem>
            <SelectItem value="Notice">Notice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setDate(date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter announcement content"
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdf">PDF Attachment (Optional)</Label>
        {(existingPdf || pdfFile) ? (
          <div className="flex items-center rounded-md border border-border p-2">
            <div className="flex-1 truncate">
              {pdfFile ? pdfFile.name : existingPdf?.name}
            </div>
            <Button variant="ghost" size="sm" type="button" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Input
            id="pdf"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : announcement ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
