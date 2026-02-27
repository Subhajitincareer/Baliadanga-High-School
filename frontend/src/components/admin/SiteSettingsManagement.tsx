import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, Plus, ImageIcon, User, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface HeroImage {
  _id?: string;
  url: string;
  fileId: string;
  caption: string;
}

interface Headmaster {
  name: string;
  designation: string;
  message: string;
  photoUrl: string;
  photoFileId: string;
}

const DEFAULT_HEADMASTER: Headmaster = {
  name: '',
  designation: 'Headmaster',
  message: '',
  photoUrl: '',
  photoFileId: '',
};

/* ---------- helpers ---------- */
const apiFetch = async (path: string, opts: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers as any) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
};

const uploadToImageKit = async (file: File, folder: string): Promise<{ url: string; fileId: string }> => {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', credentials: 'include', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return { url: json.url, fileId: json.fileId || '' };
};

/* =============================== component =============================== */
export const SiteSettingsManagement: React.FC = () => {
  const { toast } = useToast();
  const [heroImages, setHeroImages]     = useState<HeroImage[]>([]);
  const [headmaster, setHeadmaster]     = useState<Headmaster>(DEFAULT_HEADMASTER);
  const [loading, setLoading]           = useState(true);
  const [savingHero, setSavingHero]     = useState(false);
  const [savingHM, setSavingHM]         = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // URL input state
  const [heroUrlInput, setHeroUrlInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const heroFileRef  = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);

  /* fetch settings on mount */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiFetch('/site-settings');
        setHeroImages(data.heroImages || []);
        setHeadmaster({ ...DEFAULT_HEADMASTER, ...data.headmaster });
      } catch (e: any) {
        toast({ title: 'Failed to load settings', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- hero image handlers ---- */
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingHero(true);
      const { url, fileId } = await uploadToImageKit(file, '/hero');
      setHeroImages(prev => [...prev, { url, fileId, caption: '' }]);
      toast({ title: 'Image uploaded successfully!' });
    } catch (err: any) {
      toast({ 
        title: 'Upload failed', 
        description: err.message.includes('not configured') 
          ? 'ImageKit not set up. Use "Add by URL" instead, or configure ImageKit credentials in backend/.env'
          : err.message, 
        variant: 'destructive' 
      });
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  const addHeroByUrl = () => {
    const url = heroUrlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { 
      toast({ title: 'Invalid URL', description: 'Please enter a valid image URL', variant: 'destructive' });
      return;
    }
    setHeroImages(prev => [...prev, { url, fileId: '', caption: '' }]);
    setHeroUrlInput('');
    toast({ title: 'Image added', description: 'Don\'t forget to click Save.' });
  };

  const removeHeroImage = (idx: number) => {
    setHeroImages(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, caption: string) => {
    setHeroImages(prev => prev.map((img, i) => i === idx ? { ...img, caption } : img));
  };

  const saveHeroImages = async () => {
    try {
      setSavingHero(true);
      await apiFetch('/site-settings/hero-images', {
        method: 'PUT',
        body: JSON.stringify({ heroImages }),
      });
      toast({ title: '✅ Hero images saved!' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSavingHero(false);
    }
  };

  /* ---- headmaster handlers ---- */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const { url, fileId } = await uploadToImageKit(file, '/headmaster');
      setHeadmaster(prev => ({ ...prev, photoUrl: url, photoFileId: fileId }));
      toast({ title: 'Photo uploaded successfully!' });
    } catch (err: any) {
      toast({ 
        title: 'Upload failed', 
        description: err.message.includes('not configured') 
          ? 'ImageKit not set up. Use "Set by URL" instead.' 
          : err.message, 
        variant: 'destructive' 
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const setPhotoByUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { 
      toast({ title: 'Invalid URL', description: 'Please enter a valid image URL', variant: 'destructive' });
      return;
    }
    setHeadmaster(prev => ({ ...prev, photoUrl: url, photoFileId: '' }));
    setPhotoUrlInput('');
    toast({ title: 'Photo URL set', description: 'Don\'t forget to save.' });
  };

  const removePhoto = () => setHeadmaster(prev => ({ ...prev, photoUrl: '', photoFileId: '' }));

  const saveHeadmaster = async () => {
    try {
      setSavingHM(true);
      await apiFetch('/site-settings/headmaster', {
        method: 'PUT',
        body: JSON.stringify(headmaster),
      });
      toast({ title: '✅ Headmaster info saved!' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSavingHM(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading site settings…</p>;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="hero">
        <TabsList className="mb-4">
          <TabsTrigger value="hero" className="gap-1"><ImageIcon className="h-4 w-4" /> Hero Carousel</TabsTrigger>
          <TabsTrigger value="headmaster" className="gap-1"><User className="h-4 w-4" /> Headmaster</TabsTrigger>
        </TabsList>

        {/* ─── Hero Images Tab ─────────────────────────────────────── */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hero Carousel Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image list */}
              {heroImages.length === 0 && (
                <p className="text-sm text-muted-foreground">No images yet. Add images using file upload or URL.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-border shadow-sm">
                    <img src={img.url} alt={`Slide ${idx + 1}`} className="w-full h-36 object-cover bg-muted" 
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+URL'; }} />
                    <div className="p-2 bg-background space-y-1">
                      <Input
                        placeholder="Caption (optional)"
                        value={img.caption}
                        onChange={e => updateCaption(idx, e.target.value)}
                        className="text-xs h-7"
                      />
                    </div>
                    <button
                      onClick={() => removeHeroImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add by URL */}
              <div className="flex items-center gap-2 pt-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Paste image URL and press Add…"
                  value={heroUrlInput}
                  onChange={e => setHeroUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHeroByUrl()}
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={addHeroByUrl} disabled={!heroUrlInput.trim()}>
                  Add
                </Button>
              </div>

              {/* Upload file */}
              <div className="flex items-center gap-3">
                <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingHero}
                  onClick={() => heroFileRef.current?.click()}
                >
                  {uploadingHero ? <span className="animate-spin mr-2">⟳</span> : <Plus className="h-4 w-4 mr-1" />}
                  {uploadingHero ? 'Uploading…' : 'Upload File'}
                </Button>
                <Button size="sm" disabled={savingHero} onClick={saveHeroImages}>
                  {savingHero ? 'Saving…' : 'Save Carousel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Headmaster Tab ──────────────────────────────────────── */}
        <TabsContent value="headmaster">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Headmaster / Principal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Photo */}
                <div className="shrink-0 space-y-2">
                  {headmaster.photoUrl ? (
                    <div className="relative group w-32 h-40 rounded-xl overflow-hidden border shadow">
                      <img src={headmaster.photoUrl} alt="Headmaster" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x160?text=Invalid+URL'; }} />
                      <button
                        onClick={removePhoto}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
                      No Photo
                    </div>
                  )}

                  {/* URL input for photo */}
                  <div className="w-32 space-y-1">
                    <Input
                      placeholder="Paste photo URL"
                      value={photoUrlInput}
                      onChange={e => setPhotoUrlInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setPhotoByUrl()}
                      className="text-xs h-7 w-32"
                    />
                    <Button variant="outline" size="sm" className="w-32 text-xs" onClick={setPhotoByUrl} disabled={!photoUrlInput.trim()}>
                      <LinkIcon className="h-3 w-3 mr-1" /> Set URL
                    </Button>
                  </div>

                  {/* File upload for photo */}
                  <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-32"
                    disabled={uploadingPhoto}
                    onClick={() => photoFileRef.current?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {uploadingPhoto ? 'Uploading…' : 'Upload File'}
                  </Button>
                </div>

                {/* Info fields */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g. Dr. Anirban Das"
                      value={headmaster.name}
                      onChange={e => setHeadmaster(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Designation</Label>
                    <Input
                      placeholder="e.g. Headmaster, M.Sc, PhD"
                      value={headmaster.designation}
                      onChange={e => setHeadmaster(prev => ({ ...prev, designation: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Message</Label>
                    <Textarea
                      rows={5}
                      placeholder="Headmaster's message to students and parents…"
                      value={headmaster.message}
                      onChange={e => setHeadmaster(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button disabled={savingHM} onClick={saveHeadmaster}>
                  {savingHM ? 'Saving…' : 'Save Headmaster Info'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
