import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, ImageOff, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService, { GalleryItem } from '@/services/api';

const CATEGORIES = ['Campus', 'Events', 'Activities', 'Other'] as const;

const GalleryManagement: React.FC = () => {
  const [images, setImages]     = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState<GalleryItem | null>(null);
  const [form, setForm]         = useState<Partial<GalleryItem>>({ url: '', fileId: '', caption: '', category: 'Campus' });
  const [filter, setFilter]     = useState<string>('All');
  const fileRef                 = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const load = async () => {
    try { const r = await apiService.getGallery(); if (r.success) setImages(r.data); }
    catch { toast({ title: 'Failed to load gallery', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ url: '', fileId: '', caption: '', category: 'Campus' }); setOpen(true); };
  const openEdit = (img: GalleryItem) => { setEditing(img); setForm({ ...img }); setOpen(true); };
  const setField = (k: keyof GalleryItem, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'gallery');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const json = await res.json();
      if (json.url) {
        setField('url', json.url);
        setField('fileId', json.fileId || '');
        toast({ title: 'Image uploaded!' });
      }
    } catch { toast({ title: 'Image upload failed', variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.url) return toast({ title: 'Please upload or enter an image URL', variant: 'destructive' });
    setSaving(true);
    try {
      if (editing) { await apiService.updateGalleryImage(editing._id, form); toast({ title: 'Photo updated!' }); }
      else { await apiService.createGalleryImage(form); toast({ title: 'Photo added to gallery!' }); }
      setOpen(false);
      load();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiService.deleteGalleryImage(id); toast({ title: 'Photo deleted' }); load(); }
    catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const filtered = filter === 'All' ? images : images.filter(img => img.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-muted-foreground">Manage school photo gallery</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Photo
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <Button key={cat} size="sm" variant={filter === cat ? 'default' : 'outline'} onClick={() => setFilter(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl text-muted-foreground">
          <ImageOff className="h-12 w-12 mb-3 text-gray-300" />
          <p className="font-medium">No photos {filter !== 'All' ? `in ${filter}` : ''}</p>
          <Button variant="outline" className="mt-3" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Photo</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map(img => (
            <div key={img._id} className="group relative rounded-xl overflow-hidden border shadow-sm bg-gray-50 aspect-square">
              {img.url ? (
                <img src={img.url} alt={img.caption || ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"><ImageOff className="h-8 w-8 text-gray-300" /></div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {img.caption && <p className="text-white text-xs text-center line-clamp-2">{img.caption}</p>}
                <Badge className="text-[10px]">{img.category}</Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7 bg-white/10 border-white/30 text-white hover:bg-white/30" onClick={() => openEdit(img)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive" className="h-7 w-7 opacity-90">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove this photo from the gallery.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(img._id)} className="bg-destructive">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Photo' : 'Add Photo to Gallery'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Image *</label>
              <div className="flex gap-2">
                <Input
                  value={form.url || ''}
                  onChange={e => setField('url', e.target.value)}
                  placeholder="Paste image URL or upload"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
              {form.url && (
                <img src={form.url} alt="preview" className="mt-2 h-28 w-full object-cover rounded-lg border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Caption</label>
              <Input value={form.caption || ''} onChange={e => setField('caption', e.target.value)} placeholder="e.g. Annual Science Fair 2024" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={form.category} onValueChange={v => setField('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Update' : 'Add to Gallery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryManagement;
