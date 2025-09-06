import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Announcement {
  _id?: string;
  title: string;
  content: string;
  category: 'Event' | 'General' | 'Academic' | 'Holiday' | 'Emergency' | 'Sports';
  targetAudience: 'All' | 'Students' | 'Staff' | 'Parents';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  publishDate: string;
  authorId: string;
  authorName: string;
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
  const [category, setCategory] = useState<'Event' | 'General' | 'Academic' | 'Holiday' | 'Emergency' | 'Sports'>(
    announcement?.category || 'General'
  );
  const [targetAudience, setTargetAudience] = useState<'All' | 'Students' | 'Staff' | 'Parents'>(
    announcement?.targetAudience || 'All'
  );
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>(
    announcement?.priority || 'Medium'
  );
  const [publishDate, setPublishDate] = useState<Date>(
    announcement?.publishDate ? new Date(announcement.publishDate) : new Date()
  );
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

      // Handle file upload
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

      const formattedDate = format(publishDate, 'yyyy-MM-dd');

      // Get current user info from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const authorId = currentUser._id || localStorage.getItem('userId') || '';
      const authorName = currentUser.fullName || currentUser.name || 'Admin';

      const announcementData = {
        title,
        content,
        category,
        targetAudience,
        priority,
        publishDate: formattedDate,
        authorId,
        authorName,
        attachments: pdfData ? [{
          filename: pdfData.name,
          url: pdfData.data,
          size: pdfFile?.size || 0,
          mimetype: 'application/pdf'
        }] : []
      };

      if (announcement?._id) {
        // Update existing announcement
        await apiService.updateAnnouncement(announcement._id, announcementData);

        toast({
          title: 'Announcement updated',
          description: 'The announcement has been updated successfully.'
        });
      } else {
        // Create new announcement
        await apiService.createAnnouncement(announcementData);

        toast({
          title: 'Announcement created',
          description: 'The announcement has been created successfully.'
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was an error saving the announcement.',
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as typeof category)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Holiday">Holiday</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Select
            value={targetAudience}
            onValueChange={(value) => setTargetAudience(value as typeof targetAudience)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Students">Students</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Parents">Parents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as typeof priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishDate">Publish Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !publishDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {publishDate ? format(publishDate, 'PP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={publishDate}
                onSelect={(date) => setPublishDate(date || new Date())}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
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
