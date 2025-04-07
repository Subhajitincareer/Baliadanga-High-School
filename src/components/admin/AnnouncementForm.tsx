
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type Announcement = {
  id: number;
  title: string;
  date: string;
  type: "Event" | "Notice";
  description: string;
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
    });
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
