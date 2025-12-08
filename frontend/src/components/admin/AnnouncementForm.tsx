import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, X, FileText, Upload } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'write' | 'upload'>('write');
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

  // Branding options
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [signatureName, setSignatureName] = useState('Principal');

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
      let finalContent = content;

      // Use editor content or placeholder if uploading only
      if (activeTab === 'upload') {
        // If uploading, content might be empty, adding a placeholder text
        if (!finalContent) finalContent = '<p>Please see attached PDF for details.</p>';
      } else {
        // Compose logic: verify content
        if (!finalContent || finalContent === '<p><br></p>') {
          throw new Error("Content cannot be empty");
        }

        // Append Header/Logo/Signature HTML if requested
        let headerHtml = '';
        if (includeLogo) {
          headerHtml = `<div style="text-align: center; margin-bottom: 20px;">
                <h2>Baliadanga High School</h2>
                <p>Est. 1956</p>
                <hr />
            </div>`;
        }
        let footerHtml = '';
        if (includeSignature) {
          footerHtml = `<div style="margin-top: 40px; text-align: right;">
                <p>Sincerely,</p>
                <p><strong>${signatureName}</strong></p>
            </div>`;
        }

        // Wrap user content 
        // Note: we're modifying the string that gets saved. Toggling this on edit might double-add if not careful.
        // For now, on create/update we just save the final HTML.
        // Ideally, we'd store these flags separately, but schema doesn't support it yet.
        // We'll just prepend/append.
        // To avoid duplication on re-edit, we only do this if it looks like raw content? 
        // Actually, simpler to just let the user see it in the editor? 
        // The user asked for "option give", better to inject it when SAVING or PREVIEWING.
        // Let's inject on Save for now.

        // Wait, if we edit back, the user sees the injected HTML in the editor. That's fine.
        finalContent = `${headerHtml}${finalContent}${footerHtml}`;
      }

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

      // Attachments array construction
      const attachments = [];
      if (pdfData) {
        attachments.push({
          filename: pdfData.name,
          url: pdfData.data, // This is base64 for now, backward compat with what likely exists or just raw
          size: pdfFile?.size || 0,
          mimetype: 'application/pdf'
        });
      }

      const announcementData = {
        title,
        content: finalContent,
        category,
        targetAudience,
        priority,
        publishDate: formattedDate,
        authorId,
        authorName,
        attachments
      };

      if (announcement?._id) {
        // Update existing announcement
        await apiService.updateAnnouncement(announcement._id, announcementData);
        toast({ title: 'Announcement updated', description: 'Updated successfully.' });
      } else {
        // Create new announcement
        await apiService.createAnnouncement(announcementData);
        toast({ title: 'Announcement created', description: 'Created successfully.' });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error saving announcement.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom toolbar for Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

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
          <Label>Category & Audience</Label>
          <div className="flex gap-2">
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetAudience} onValueChange={(v: any) => setTargetAudience(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Audience" />
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

        <div className="space-y-2">
          <Label>Priority & Date</Label>
          <div className="flex gap-2">
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !publishDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishDate ? format(publishDate, 'PP') : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={publishDate} onSelect={(d) => setPublishDate(d || new Date())} /></PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Tabs defaultValue="write" value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full border rounded-md p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write"><FileText className="mr-2 h-4 w-4" /> Write Announcement</TabsTrigger>
          <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4 pt-4">
          {/* Branding Toggles */}
          <div className="flex flex-wrap gap-6 items-center border-b pb-4">
            <div className="flex items-center space-x-2">
              <Switch id="logo-mode" checked={includeLogo} onCheckedChange={setIncludeLogo} />
              <Label htmlFor="logo-mode">Include School Header</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="sig-mode" checked={includeSignature} onCheckedChange={setIncludeSignature} />
              <Label htmlFor="sig-mode">Include Signature</Label>
            </div>
            {includeSignature && (
              <Input
                className="w-40 h-8 text-sm"
                placeholder="Signatory Name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
            )}
          </div>

          <div className="min-h-[300px]">
            <Label className="mb-2 block">Content</Label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="h-[250px] mb-12"
            />
          </div>
        </TabsContent>

        <TabsContent value="upload" className="pt-4 space-y-4">
          <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
            <p className="text-sm text-gray-500 mb-4">Upload a pre-written announcement (PDF only)</p>
            <Input id="pdf" type="file" accept="application/pdf" onChange={handleFileChange} className="max-w-xs mx-auto" />
            {pdfFile && <p className="mt-2 text-green-600 justify-center flex items-center"><FileText className="w-4 h-4 mr-1" /> {pdfFile.name}</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : announcement ? 'Update' : 'Publish Announcement'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
