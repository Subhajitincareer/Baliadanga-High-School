import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, Plus, ImageIcon, User, Link as LinkIcon, School, Phone, MapPin, Layout, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ────────────────────────── types ────────────────────────── */
interface HeroImage { _id?: string; url: string; fileId: string; caption: string }

const apiFetch = async (path: string, opts: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers as any) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
};

const uploadToImageKit = async (file: File, folder: string) => {
  const form = new FormData();
  form.append('file', file); form.append('folder', folder);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', credentials: 'include', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return { url: json.url as string, fileId: json.fileId as string || '' };
};

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
export const SiteSettingsManagement: React.FC = () => {
  const { toast } = useToast();
  const { settings: liveSettings, refresh } = useSiteSettings();

  /* ── hero images ──────────────────────────────── */
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroUrlInput, setHeroUrlInput] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  /* ── headmaster ───────────────────────────────── */
  const [headmaster, setHeadmaster] = useState(liveSettings.headmaster);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [savingHM, setSavingHM] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);

  /* ── school info ──────────────────────────────── */
  const [schoolInfo, setSchoolInfo]   = useState(liveSettings.schoolInfo);
  /* ── theme ────────────────────────────────────── */
  const [theme, setTheme]             = useState(liveSettings.theme);
  /* ── contact ──────────────────────────────────── */
  const [contact, setContact]         = useState(liveSettings.contact);
  /* ── footer ───────────────────────────────────── */
  const [footer, setFooter]           = useState(liveSettings.footer);
  /* ── map ──────────────────────────────────────── */
  const [map, setMap]                 = useState(liveSettings.map);
  /* ── ticker ───────────────────────────────────── */
  const [ticker, setTicker]           = useState(liveSettings.ticker);
  /* ── popup ────────────────────────────────────── */
  const [popup, setPopup]             = useState(liveSettings.popup);
  const [popupUrlInput, setPopupUrlInput] = useState('');
  const [uploadingPopup, setUploadingPopup] = useState(false);
  const popupFileRef = useRef<HTMLInputElement>(null);

  const [savingGeneral, setSavingGeneral] = useState(false);

  /* Sync state when live settings load (after context fetches) */
  useEffect(() => {
    setHeroImages(liveSettings.heroImages);
    setHeadmaster(liveSettings.headmaster);
    setSchoolInfo(liveSettings.schoolInfo);
    setTheme(liveSettings.theme);
    setContact(liveSettings.contact);
    setFooter(liveSettings.footer);
    setMap(liveSettings.map);
    setTicker(liveSettings.ticker);
    setPopup(liveSettings.popup);
  }, [liveSettings]);

  /* ─────────────────── hero handlers ─────────────────── */
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setUploadingHero(true);
      const { url, fileId } = await uploadToImageKit(file, '/hero');
      setHeroImages(p => [...p, { url, fileId, caption: '' }]);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally { setUploadingHero(false); e.target.value = ''; }
  };

  const addHeroByUrl = () => {
    const url = heroUrlInput.trim(); if (!url) return;
    try { new URL(url); } catch { toast({ title: 'Invalid URL', variant: 'destructive' }); return; }
    setHeroImages(p => [...p, { url, fileId: '', caption: '' }]);
    setHeroUrlInput('');
  };

  const saveHeroImages = async () => {
    try {
      setSavingHero(true);
      await apiFetch('/site-settings/hero-images', { method: 'PUT', body: JSON.stringify({ heroImages }) });
      toast({ title: '✅ Hero images saved!' });
      refresh();
    } catch (err: any) { toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSavingHero(false); }
  };

  /* ─────────────────── headmaster handlers ─────────────────── */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setUploadingPhoto(true);
      const { url, fileId } = await uploadToImageKit(file, '/headmaster');
      setHeadmaster(p => ({ ...p, photoUrl: url, photoFileId: fileId }));
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally { setUploadingPhoto(false); e.target.value = ''; }
  };

  const saveHeadmaster = async () => {
    try {
      setSavingHM(true);
      await apiFetch('/site-settings/headmaster', { method: 'PUT', body: JSON.stringify(headmaster) });
      toast({ title: '✅ Headmaster info saved!' });
      refresh();
    } catch (err: any) { toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSavingHM(false); }
  };

  /* ─────────────────── general save ─────────────────── */
  const saveGeneral = async () => {
    try {
      setSavingGeneral(true);
      await apiFetch('/site-settings/general', {
        method: 'PUT',
        body: JSON.stringify({ schoolInfo, theme, contact, footer, map, ticker, popup }),
      });
      toast({ title: '✅ Settings saved! Changes apply instantly.' });
      refresh(); // re-apply theme vars via context
    } catch (err: any) { toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally { setSavingGeneral(false); }
  };

  /* ══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="space-y-4">
      <Tabs defaultValue="hero">
        {/* ── Tab bar ── */}
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          <TabsTrigger value="hero"       className="gap-1"><ImageIcon className="h-4 w-4" /> Hero Carousel</TabsTrigger>
          <TabsTrigger value="headmaster" className="gap-1"><User      className="h-4 w-4" /> Headmaster</TabsTrigger>
          <TabsTrigger value="school"     className="gap-1"><School    className="h-4 w-4" /> School &amp; Theme</TabsTrigger>
          <TabsTrigger value="contact"    className="gap-1"><Phone     className="h-4 w-4" /> Contact</TabsTrigger>
          <TabsTrigger value="footer"     className="gap-1"><Layout    className="h-4 w-4" /> Footer</TabsTrigger>
          <TabsTrigger value="map"        className="gap-1"><MapPin    className="h-4 w-4" /> Map</TabsTrigger>
          <TabsTrigger value="ticker"     className="gap-1">📢 Ticker</TabsTrigger>
          <TabsTrigger value="popup"      className="gap-1">🖼️ Popup</TabsTrigger>
        </TabsList>

        {/* ══ Hero Carousel Tab ══════════════════════════════════════════ */}
        <TabsContent value="hero">
          <Card>
            <CardHeader><CardTitle className="text-base">Hero Carousel Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {heroImages.length === 0 && <p className="text-sm text-muted-foreground">No images yet.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border shadow-sm">
                    <img src={img.url} alt={`Slide ${idx + 1}`} className="w-full h-36 object-cover bg-muted"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Invalid+URL'; }} />
                    <div className="p-2 bg-background">
                      <Input placeholder="Caption (optional)" value={img.caption} className="text-xs h-7"
                        onChange={e => setHeroImages(p => p.map((i, j) => j === idx ? { ...i, caption: e.target.value } : i))} />
                    </div>
                    <button onClick={() => setHeroImages(p => p.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input placeholder="Paste image URL…" value={heroUrlInput} onChange={e => setHeroUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHeroByUrl()} className="text-sm" />
                <Button variant="outline" size="sm" onClick={addHeroByUrl} disabled={!heroUrlInput.trim()}>Add</Button>
              </div>
              <div className="flex items-center gap-3">
                <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                <Button variant="outline" size="sm" disabled={uploadingHero} onClick={() => heroFileRef.current?.click()}>
                  {uploadingHero ? '⟳ Uploading…' : <><Plus className="h-4 w-4 mr-1" />Upload File</>}
                </Button>
                <Button size="sm" disabled={savingHero} onClick={saveHeroImages}>{savingHero ? 'Saving…' : 'Save Carousel'}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Headmaster Tab ═════════════════════════════════════════════ */}
        <TabsContent value="headmaster">
          <Card>
            <CardHeader><CardTitle className="text-base">Headmaster / Principal Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0 space-y-2">
                  {headmaster.photoUrl ? (
                    <div className="relative group w-32 h-40 rounded-xl overflow-hidden border shadow">
                      <img src={headmaster.photoUrl} alt="Headmaster" className="w-full h-full object-cover" />
                      <button onClick={() => setHeadmaster(p => ({ ...p, photoUrl: '', photoFileId: '' }))}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-40 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">No Photo</div>
                  )}
                  <div className="w-32 space-y-1">
                    <Input placeholder="Paste photo URL" value={photoUrlInput} onChange={e => setPhotoUrlInput(e.target.value)} className="text-xs h-7 w-32"
                      onKeyDown={e => { if (e.key === 'Enter' && photoUrlInput.trim()) { setHeadmaster(p => ({ ...p, photoUrl: photoUrlInput.trim(), photoFileId: '' })); setPhotoUrlInput(''); } }} />
                    <Button variant="outline" size="sm" className="w-32 text-xs"
                      onClick={() => { if (photoUrlInput.trim()) { setHeadmaster(p => ({ ...p, photoUrl: photoUrlInput.trim(), photoFileId: '' })); setPhotoUrlInput(''); } }}>
                      <LinkIcon className="h-3 w-3 mr-1" /> Set URL
                    </Button>
                  </div>
                  <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <Button variant="outline" size="sm" className="w-32" disabled={uploadingPhoto} onClick={() => photoFileRef.current?.click()}>
                    <Upload className="h-3 w-3 mr-1" />{uploadingPhoto ? 'Uploading…' : 'Upload File'}
                  </Button>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Name', key: 'name', placeholder: 'Dr. Anirban Das' },
                    { label: 'Designation', key: 'designation', placeholder: 'Headmaster, M.Sc, PhD' },
                  ].map(({ label, key, placeholder }) => (
                    <div className="space-y-1" key={key}>
                      <Label>{label}</Label>
                      <Input placeholder={placeholder} value={(headmaster as any)[key]}
                        onChange={e => setHeadmaster(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label>Message</Label>
                    <Textarea rows={5} placeholder="Headmaster's message…" value={headmaster.message}
                      onChange={e => setHeadmaster(p => ({ ...p, message: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button disabled={savingHM} onClick={saveHeadmaster}>{savingHM ? 'Saving…' : 'Save Headmaster Info'}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ School Info & Theme Tab ════════════════════════════════════ */}
        <TabsContent value="school">
          <div className="space-y-4">
            {/* School Info */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><School className="h-4 w-4" /> School Identity</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>School Name</Label>
                  <Input value={schoolInfo.name} onChange={e => setSchoolInfo(p => ({ ...p, name: e.target.value }))}
                    placeholder="Baliadanga High School" />
                </div>
                <div className="space-y-1">
                  <Label>Established Year</Label>
                  <Input value={schoolInfo.established} onChange={e => setSchoolInfo(p => ({ ...p, established: e.target.value }))}
                    placeholder="1963" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>Tagline / Motto</Label>
                  <Input value={schoolInfo.tagline} onChange={e => setSchoolInfo(p => ({ ...p, tagline: e.target.value }))}
                    placeholder="Educating and inspiring since 1963" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label>Logo URL</Label>
                  <Input value={schoolInfo.logoUrl} onChange={e => setSchoolInfo(p => ({ ...p, logoUrl: e.target.value }))}
                    placeholder="https://… (leave blank to use ./logo.png)" />
                </div>
              </CardContent>
            </Card>

            {/* Theme Colors */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Theme Colors</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">Changes apply to the whole website — navbar, buttons, accents, footer highlight, etc.</p>
                <div className="grid sm:grid-cols-3 gap-6">
                  {([
                    { label: 'Primary Color', key: 'primaryColor', hint: 'Navbar, headings, buttons' },
                    { label: 'Secondary Color', key: 'secondaryColor', hint: 'Highlights, badges' },
                    { label: 'Accent Color', key: 'accentColor', hint: 'Links, hover effects' },
                  ] as const).map(({ label, key, hint }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <p className="text-[11px] text-muted-foreground">{hint}</p>
                      <div className="flex items-center gap-3">
                        <input type="color" value={theme[key]} onChange={e => setTheme(p => ({ ...p, [key]: e.target.value }))}
                          className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-white" />
                        <Input value={theme[key]} onChange={e => setTheme(p => ({ ...p, [key]: e.target.value }))}
                          className="font-mono text-sm" placeholder="#1e3a5f" />
                      </div>
                      <div className="w-full h-6 rounded-md border" style={{ backgroundColor: theme[key] }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
                {savingGeneral ? 'Saving…' : '💾 Save School & Theme'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ══ Contact Tab ════════════════════════════════════════════════ */}
        <TabsContent value="contact">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {([
                { label: 'Primary Phone', key: 'phone', placeholder: '+91 9876543210' },
                { label: 'Secondary Phone (optional)', key: 'phoneAlt', placeholder: '+91 9876543211' },
                { label: 'Primary Email', key: 'email', placeholder: 'info@baliadangahs.edu' },
                { label: 'Admissions Email (optional)', key: 'emailAlt', placeholder: 'admissions@baliadangahs.edu' },
              ] as const).map(({ label, key, placeholder }) => (
                <div className="space-y-1" key={key}>
                  <Label>{label}</Label>
                  <Input value={contact[key]} onChange={e => setContact(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <Label>Physical Address</Label>
                <Textarea rows={2} value={contact.address}
                  onChange={e => setContact(p => ({ ...p, address: e.target.value }))}
                  placeholder="Baliadanga Rd, P.O. Baliadanga, West Bengal 741152, India" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Office Hours <span className="text-muted-foreground text-xs">(one line per entry)</span></Label>
                <Textarea rows={4} value={contact.officeHours}
                  onChange={e => setContact(p => ({ ...p, officeHours: e.target.value }))}
                  placeholder={"Mon–Fri: 10:00 AM–4:00 PM\nSaturday: 10:00 AM–2:00 PM\nSunday: Closed"} />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
              {savingGeneral ? 'Saving…' : '💾 Save Contact Info'}
            </Button>
          </div>
        </TabsContent>

        {/* ══ Footer Tab ═════════════════════════════════════════════════ */}
        <TabsContent value="footer">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4" /> Footer Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Footer Tagline</Label>
                <Input value={footer.tagline} onChange={e => setFooter(p => ({ ...p, tagline: e.target.value }))}
                  placeholder="Educating and inspiring since 1963" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Facebook URL</Label>
                  <Input value={footer.facebook} onChange={e => setFooter(p => ({ ...p, facebook: e.target.value }))}
                    placeholder="https://facebook.com/yourpage" />
                </div>
                <div className="space-y-1">
                  <Label>Instagram URL</Label>
                  <Input value={footer.instagram} onChange={e => setFooter(p => ({ ...p, instagram: e.target.value }))}
                    placeholder="https://instagram.com/yourpage" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Copyright Text <span className="text-muted-foreground text-xs">(leave blank for auto)</span></Label>
                <Input value={footer.copyright} onChange={e => setFooter(p => ({ ...p, copyright: e.target.value }))}
                  placeholder="© 2025 Baliadanga High School. All rights reserved." />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
              {savingGeneral ? 'Saving…' : '💾 Save Footer Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* ══ Map Tab ════════════════════════════════════════════════════ */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Map Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Google Maps Embed URL</Label>
                <p className="text-xs text-muted-foreground">
                  Go to Google Maps → search your school → Share → Embed a map → Copy the <code>src</code> URL from the iframe code.
                </p>
                <Textarea rows={4} value={map.embedUrl} onChange={e => setMap(p => ({ ...p, embedUrl: e.target.value }))}
                  placeholder="https://www.google.com/maps/embed?pb=…" className="font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <Label>Directions URL</Label>
                <p className="text-xs text-muted-foreground">"View larger map" link shown below the embedded map.</p>
                <Input value={map.directionsUrl} onChange={e => setMap(p => ({ ...p, directionsUrl: e.target.value }))}
                  placeholder="https://goo.gl/maps/…" />
              </div>

              {/* Live preview */}
              {map.embedUrl && (
                <div>
                  <Label className="mb-1 block">Live Preview</Label>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border">
                    <iframe src={map.embedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Map Preview" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
              {savingGeneral ? 'Saving…' : '💾 Save Map Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* ══ Notice Ticker Tab ════════════════════════════════════════ */}
        <TabsContent value="ticker">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notice Ticker (Latest News)</CardTitle>
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <Switch checked={ticker.active} onCheckedChange={c => setTicker(p => ({ ...p, active: c }))} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage the scrolling text alerts shown below the navigation bar.</p>
              
              <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                {ticker.messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No active notices.</p>}
                {ticker.messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Input 
                      value={msg} 
                      onChange={e => {
                        const newMsgs = [...ticker.messages];
                        newMsgs[idx] = e.target.value;
                        setTicker(p => ({ ...p, messages: newMsgs }));
                      }} 
                    />
                    <Button variant="outline" size="icon" className="shrink-0 text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                      setTicker(p => ({ ...p, messages: p.messages.filter((_, i) => i !== idx) }));
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 border-dashed" onClick={() => {
                  setTicker(p => ({ ...p, messages: [...p.messages, 'New Notice'] }));
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Notice
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
              {savingGeneral ? 'Saving…' : '💾 Save settings'}
            </Button>
          </div>
        </TabsContent>

        {/* ══ Global Popup Tab ═════════════════════════════════════════ */}
        <TabsContent value="popup">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Global Popup Banner</CardTitle>
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <Switch checked={popup.active} onCheckedChange={c => setPopup(p => ({ ...p, active: c }))} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Shows exactly once per browser session when users visit the site.</p>
              
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={popup.title} onChange={e => setPopup(p => ({ ...p, title: e.target.value }))} placeholder="Important Announcement" />
              </div>
              
              <div className="space-y-1">
                <Label>Content Box</Label>
                <Textarea rows={4} value={popup.content} onChange={e => setPopup(p => ({ ...p, content: e.target.value }))} placeholder="The school will remain closed on..." />
              </div>

              <div className="space-y-2 mt-4">
                <Label>Header Image (Optional)</Label>
                {popup.imageUrl && (
                  <div className="relative group w-full max-w-sm h-32 rounded-lg overflow-hidden border">
                    <img src={popup.imageUrl} alt="Popup Header" className="w-full h-full object-cover" />
                    <button onClick={() => setPopup(p => ({ ...p, imageUrl: '' }))}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 max-w-sm">
                  <Input placeholder="Paste image URL…" value={popupUrlInput} onChange={e => setPopupUrlInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && popupUrlInput.trim()) { 
                        setPopup(p => ({ ...p, imageUrl: popupUrlInput.trim() })); 
                        setPopupUrlInput(''); 
                      }
                    }} className="text-sm" />
                  <Button variant="outline" size="sm" onClick={() => {
                    if (popupUrlInput.trim()) {
                      setPopup(p => ({ ...p, imageUrl: popupUrlInput.trim() }));
                      setPopupUrlInput('');
                    }
                  }}>Set URL</Button>
                  
                  <input ref={popupFileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    try {
                      setUploadingPopup(true);
                      const { url } = await uploadToImageKit(file, '/popup');
                      setPopup(p => ({ ...p, imageUrl: url }));
                    } catch (err: any) { toast({ title: 'Upload failed', variant: 'destructive' }); } 
                    finally { setUploadingPopup(false); e.target.value = ''; }
                  }} />
                  <Button variant="outline" size="sm" disabled={uploadingPopup} onClick={() => popupFileRef.current?.click()}>
                    {uploadingPopup ? 'Uploading…' : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button disabled={savingGeneral} onClick={saveGeneral} className="min-w-[160px]">
              {savingGeneral ? 'Saving…' : '💾 Save settings'}
            </Button>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};
