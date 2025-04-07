
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Announcement = {
  id: number;
  title: string;
  date: string;
  type: "Event" | "Notice";
  description: string;
  pdfFile?: {
    name: string;
    data: string; // Base64 encoded PDF data
  };
};

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSave: (announcement: Omit<Announcement, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ 
  announcement, 
  onSave, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(announcement?.title || '');
  const [date, setDate] = useState(announcement?.date || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<"Event" | "Notice">(announcement?.type || "Notice");
  const [description, setDescription] = useState(announcement?.description || '');
  const [pdfFile, setPdfFile] = useState<{ name: string; data: string } | undefined>(announcement?.pdfFile);
  const [fileLoading, setFileLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: announcement?.id,
      title,
      date,
      type,
      description,
      pdfFile,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF files only.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "PDF files must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setFileLoading(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setPdfFile({
        name: file.name,
        data: base64String,
      });
      setFileLoading(false);
    };
    reader.onerror = () => {
      toast({
        title: "File Error",
        description: "Failed to read the PDF file.",
        variant: "destructive",
      });
      setFileLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const removePdf = () => {
    setPdfFile(undefined);
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{announcement ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="notice"
                    name="type"
                    value="Notice"
                    checked={type === "Notice"}
                    onChange={() => setType("Notice")}
                    className="h-4 w-4 text-school-primary"
                  />
                  <label htmlFor="notice" className="text-sm font-medium">Notice</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="event"
                    name="type"
                    value="Event"
                    checked={type === "Event"}
                    onChange={() => setType("Event")}
                    className="h-4 w-4 text-school-primary"
                  />
                  <label htmlFor="event" className="text-sm font-medium">Event</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter announcement description"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfFile">Attach PDF Document (Optional)</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={fileLoading}
                className={fileLoading ? "opacity-50" : ""}
              />
              
              {fileLoading && (
                <p className="text-sm text-muted-foreground">Loading file...</p>
              )}
              
              {pdfFile && (
                <div className="mt-2 flex items-center rounded-md border border-border bg-background p-2">
                  <Paperclip className="mr-2 h-4 w-4 text-school-primary" />
                  <span className="flex-1 truncate text-sm">{pdfFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePdf}
                    className="hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-school-primary hover:bg-school-primary/90">
            {announcement ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AnnouncementForm;
