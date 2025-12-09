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
import { Calendar as CalendarIcon, X, FileText, Upload, LayoutTemplate } from 'lucide-react';
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

const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank Template',
    category: 'General',
    content: ''
  },
  {
    id: 'official',
    label: 'Official Letterhead (Green)',
    category: 'General',
    content: `
      <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #1b5e20, #2e7d32); color: white; padding: 20px; border-radius: 8px 8px 0 0; display: flex; align-items: center;">
            <div style="flex: 1; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; color: #fff;">BALIADANGA HIGH SCHOOL</h1>
                <p style="margin: 5px 0; font-size: 14px; color: #e8f5e9;">P.O.: Baliadanga, Dist.: Nadia, Pin: 741152</p>
                <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-top: 5px;">
                  ESTD: 1956
                </div>
            </div>
        </div>
        
        <div style="padding: 30px; border: 1px solid #ddd; border-top: none; background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <div><strong>Ref No:</strong> ........................</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <h2 style="font-size: 22px; text-decoration: underline; margin: 0; color: #1b5e20; text-transform: uppercase;">NOTICE</h2>
                <h3 style="font-size: 16px; margin: 10px 0 0; color: #333;">Sub: [Subject of the Notice]</h3>
            </div>

            <div style="font-size: 16px; line-height: 1.8; color: #222; min-height: 200px; text-align: justify;">
                <p>This is to inform all the students of Baliadanga High School that...</p>
                <p>[Write your main content here]</p>
            </div>

            <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
                 <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; border: 2px dashed #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 10px;">
                      [Stamp]
                    </div>
                 </div>
                 <div style="text-align: center; padding-right: 20px;">
                    <div style="height: 40px;"></div>
                    <p style="font-weight: bold; margin: 0; color: #000;">Headmaster / TIC</p>
                    <p style="margin: 0; color: #555;">Baliadanga High School</p>
                </div>
            </div>
        </div>
      </div>
    `
  },
  {
    id: 'kanyashree',
    label: 'Kanyashree Form Notice',
    category: 'Academic',
    content: `
      <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; border: 1px solid #ccc;">
        <!-- Header -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #1b5e20;">
            <h1 style="color: #1b5e20; margin: 0;">BALIADANGA HIGH SCHOOL</h1>
            <p style="margin: 5px 0;">P.O.: Baliadanga, Dist.: Nadia</p>
        </div>

        <div style="padding: 40px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <span>Ref: .............</span>
                <span>Date: ${new Date().toLocaleDateString()}</span>
            </div>

            <h2 style="text-align: center; text-decoration: underline; margin-bottom: 30px;">NOTICE - KANYASHREE (K2) FORM DISTRIBUTION</h2>

            <div style="font-size: 16px; line-height: 1.6;">
                <p>It is hereby informed to all first-semester/eligible female students that the Kanyashree (K2) forms will be distributed from the school office on <strong>[Date]</strong>.</p>
                <p><strong>Time:</strong> 11:00 AM to 2:00 PM</p>
                <p><strong>Required Documents:</strong></p>
                <ul>
                    <li>Kanyashree ID / Transfer Certificate</li>
                    <li>Aadhaar Card</li>
                    <li>Bank Passbook Copy</li>
                </ul>
                <p>Students must come personally to collect the form.</p>
            </div>

            <div style="margin-top: 50px; text-align: right;">
                <p><strong>Teacher-in-Charge</strong></p>
                <p>Baliadanga High School</p>
            </div>
        </div>
      </div>
    `
  },
  {
    id: 'holiday',
    label: 'Holiday Notice',
    category: 'Holiday',
    content: `
      <h3><strong>Holiday Notice</strong></h3>
      <p>Dear Students and Staff,</p>
      <p>This is to inform you that the school will remain closed on <strong>[Date]</strong> on account of <strong>[Occasion]</strong>.</p>
      <p>Regular classes will resume from <strong>[Resume Date]</strong>.</p>
      <p>Enjoy your holiday!</p>
    `
  },
  {
    id: 'exam',
    label: 'Exam Schedule',
    category: 'Academic',
    content: `
      <h3><strong>Examination Schedule</strong></h3>
      <p>Please find below the schedule for the upcoming exams:</p>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ccc; padding: 8px;">Date</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Subject</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">DD/MM/YYYY</td>
            <td style="border: 1px solid #ccc; padding: 8px;">Mathematics</td>
            <td style="border: 1px solid #ccc; padding: 8px;">10:00 AM - 1:00 PM</td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: 'emergency',
    label: 'Emergency Alert',
    category: 'Emergency',
    content: `
      <h3 style="color: red;"><strong>URGENT NOTICE</strong></h3>
      <p>Due to <strong>[Reason]</strong>, the school will remain closed tomorrow, <strong>[Date]</strong>.</p>
    `
  }
];

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

  // Template handling
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template && template.id !== 'blank') {
      setContent(template.content);
      // Automatically set category if it matches
      if (template.category) {
        setCategory(template.category as any);
      }
    }
  };

  // Branding options
  const [includeLogo, setIncludeLogo] = useState(false); // Default false as template includes it often
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
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent', 'color', 'background',
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
            {/* Template Selector */}
            <div className="space-y-2">
              <Label htmlFor="template" className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /> Usage Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Branding Toggles - only show if NOT using a template that already has it (simple heuristic) or just let user toggle */}
          <div className="flex flex-wrap gap-6 items-center border-b pb-4 mb-4">
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
