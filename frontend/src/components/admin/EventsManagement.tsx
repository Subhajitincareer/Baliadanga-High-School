import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Calendar, Clock, MapPin, ImageOff, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService, { EventItem } from '@/services/api';

const CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Administrative', 'Other'] as const;

const EMPTY: Partial<EventItem> = { title: '', date: '', time: '', location: '', category: 'Academic', description: '', imageUrl: '', imageFileId: '' };

const EventsManagement: React.FC = () => {
  const [events, setEvents]       = useState<EventItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState<EventItem | null>(null);
  const [form, setForm]           = useState<Partial<EventItem>>(EMPTY);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const load = async () => {
    try { const r = await apiService.getSchoolEvents(); if (r.success) setEvents(r.data); }
    catch { toast({ title: 'Failed to load events', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (e: EventItem) => { setEditing(e); setForm({ ...e }); setOpen(true); };
  const setField = (k: keyof EventItem, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'events');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const json = await res.json();
      if (json.url) { setField('imageUrl', json.url); setField('imageFileId', json.fileId || ''); toast({ title: 'Image uploaded!' }); }
    } catch { toast({ title: 'Image upload failed', variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return toast({ title: 'Title and date are required', variant: 'destructive' });
    setSaving(true);
    try {
      if (editing) { await apiService.updateSchoolEvent(editing._id, form); toast({ title: 'Event updated!' }); }
      else { await apiService.createSchoolEvent(form); toast({ title: 'Event created!' }); }
      setOpen(false);
      load();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiService.deleteSchoolEvent(id); toast({ title: 'Event deleted' }); load(); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events Management</h2>
          <p className="text-muted-foreground">Add, edit and remove school events</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-muted-foreground">
          <Calendar className="h-12 w-12 mb-3 text-gray-300" />
          <p className="font-medium">No events yet</p>
          <Button variant="outline" className="mt-3" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add First Event</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map(ev => (
            <Card key={ev._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-36 overflow-hidden bg-gray-100">
                {ev.imageUrl ? (
                  <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageOff className="h-8 w-8 text-gray-300" /></div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{ev.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0 text-xs">{ev.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(ev.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                {ev.time && <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ev.time}</div>}
                {ev.location && <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ev.location}</div>}
              </CardContent>
              <div className="p-4 pt-0 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-1"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete "{ev.title}". This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(ev._id)} className="bg-destructive">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={form.title || ''} onChange={e => setField('title', e.target.value)} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date *</label>
                <Input type="date" value={form.date || ''} onChange={e => setField('date', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input value={form.time || ''} onChange={e => setField('time', e.target.value)} placeholder="9:00 AM - 12:00 PM" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Input value={form.location || ''} onChange={e => setField('location', e.target.value)} placeholder="School Auditorium" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Brief description..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Event Image</label>
              <div className="flex gap-2">
                <Input
                  value={form.imageUrl || ''}
                  onChange={e => setField('imageUrl', e.target.value)}
                  placeholder="Paste image URL or upload below"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
