import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEvent } from '@/services/api'; // Using api.ts interface
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EventDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedEvent: CalendarEvent | null;
    onSuccess: () => void;
}

export const EventDialog: React.FC<EventDialogProps> = ({
    isOpen,
    onOpenChange,
    selectedEvent,
    onSuccess
}) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState(''); // New state for end date
    const [type, setType] = useState<'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'MEETING' | 'TERM'>('ACTIVITY');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (selectedEvent) {
            setTitle(selectedEvent.title);
            // Handle date string or Date object
            const eventDate = new Date(selectedEvent.date);
            setDate(format(eventDate, 'yyyy-MM-dd'));
            if (selectedEvent.endDate) {
                const eventEndDate = new Date(selectedEvent.endDate);
                setEndDate(format(eventEndDate, 'yyyy-MM-dd'));
            } else {
                setEndDate('');
            }
            setType(selectedEvent.type);
            setDescription(selectedEvent.description || '');
            setStartTime(selectedEvent.startTime || '');
            setEndTime(selectedEvent.endTime || '');
        } else {
            resetForm();
        }
    }, [selectedEvent, isOpen]);

    const resetForm = () => {
        setTitle('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate('');
        setType('ACTIVITY');
        setDescription('');
        setStartTime('');
        setEndTime('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const eventData: Partial<CalendarEvent> = {
                title,
                date: new Date(date).toISOString(), // Ensure ISO string for backend
                type,
                description,
                startTime,
                endTime,
                ...(endDate && { endDate: new Date(endDate).toISOString() })
            };

            if (selectedEvent && selectedEvent._id) {
                await apiService.updateEvent(selectedEvent._id, eventData);
                toast({ title: 'Event updated', description: 'Updated successfully.' });
            } else {
                await apiService.createEvent(eventData);
                toast({ title: 'Event created', description: 'Created successfully.' });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save event',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Annual Sports Day"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Start Date</Label>
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
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVITY">Activity</SelectItem>
                                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                    <SelectItem value="EXAM">Exam</SelectItem>
                                    <SelectItem value="MEETING">Meeting</SelectItem>
                                    <SelectItem value="TERM">Academic Term</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {(type === 'TERM' || type === 'EXAM') && (
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Select end date for ranges"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time (Optional)</Label>
                            <Input
                                id="startTime"
                                type="text"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="09:00 AM"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time (Optional)</Label>
                            <Input
                                id="endTime"
                                type="text"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="02:00 PM"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Additional details..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
