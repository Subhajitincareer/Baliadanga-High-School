import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload, Trash2, Loader2, Download, BookOpen, FileText,
  Eye, Lightbulb, Star, Search, Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService, { CourseMaterial } from '@/services/api';

// ── Constants ───────────────────────────────────────────────────────────────
const GRADES = [
  'Class V', 'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
];

const MATERIAL_TYPES: { value: CourseMaterial['type']; label: string; color: string }[] = [
  { value: 'booklist',   label: 'Booklist',        color: 'bg-blue-100 text-blue-700' },
  { value: 'paper',      label: 'Exam Papers',     color: 'bg-violet-100 text-violet-700' },
  { value: 'syllabus',   label: 'Syllabus',        color: 'bg-green-100 text-green-700' },
  { value: 'note',       label: 'Notes',           color: 'bg-amber-100 text-amber-700' },
  { value: 'suggestion', label: 'Exam Suggestion', color: 'bg-rose-100 text-rose-700' },
];

const typeLabel = (t: string) => MATERIAL_TYPES.find(m => m.value === t)?.label ?? t;
const typeColor = (t: string) => MATERIAL_TYPES.find(m => m.value === t)?.color ?? 'bg-slate-100 text-slate-700';
const fmtSize = (b?: number) => !b ? '' : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

// ── Component ────────────────────────────────────────────────────────────────
const CourseMaterialManagement: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload form
  const [grade, setGrade] = useState('');
  const [type, setType] = useState<CourseMaterial['type'] | ''>('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // List
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCourseMaterials();
      setMaterials(data);
    } catch {
      toast({ title: 'Failed to load materials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!grade || !type || !title || !file) {
      toast({ title: 'Class, type, title and file are required', variant: 'destructive' });
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('grade', grade);
    fd.append('type', type);
    fd.append('title', title);
    fd.append('subject', subject || 'General');
    fd.append('year', year);
    fd.append('description', desc);

    setUploading(true);
    try {
      const newMat = await apiService.uploadCourseMaterial(fd);
      toast({ title: 'Uploaded successfully!' });
      setMaterials(prev => [newMat, ...prev]);
      // reset
      setTitle(''); setDesc(''); setSubject(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await apiService.deleteCourseMaterial(id);
      toast({ title: 'Deleted' });
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const filtered = materials.filter(m => {
    const gOk = filterGrade === 'all' || m.grade === filterGrade;
    const tOk = filterType === 'all' || m.type === filterType;
    const sOk = !searchTerm || m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    return gOk && tOk && sOk;
  });

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Materials</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload and manage booklists, papers, syllabus, notes and exam suggestions for each class.
          </p>
        </div>
      )}

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1.5" />Upload New</TabsTrigger>
          <TabsTrigger value="manage"><FileText className="h-4 w-4 mr-1.5" />Manage All ({materials.length})</TabsTrigger>
        </TabsList>

        {/* ── UPLOAD TAB ── */}
        <TabsContent value="upload">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Upload Course Material</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Class *</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select class…" /></SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Material Type *</Label>
                  <Select value={type} onValueChange={v => setType(v as CourseMaterial['type'])}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select type…" /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Class V Booklist 2025" className="h-9" />
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Subject</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics (or leave blank)" className="h-9" />
                </div>

                {/* Year */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Year</Label>
                  <Input value={year} onChange={e => setYear(e.target.value)} className="h-9" />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Description (optional)</Label>
                  <Textarea value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Short description…" rows={2} className="text-sm" />
                </div>

                {/* File */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">File * (PDF / DOC / PPT / XLSX — max 15 MB)</Label>
                  <input ref={fileRef} type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls"
                    className="block w-full text-sm file:mr-2 file:h-8 file:rounded file:border-0 file:bg-school-primary file:text-white file:px-3 file:text-xs cursor-pointer border rounded-md p-1"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                  {file && <p className="text-xs text-muted-foreground">{file.name} — {fmtSize(file.size)}</p>}
                </div>
              </div>

              <Button onClick={handleUpload} disabled={uploading} className="mt-5 w-full gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading…' : 'Upload File'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MANAGE TAB ── */}
        <TabsContent value="manage" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-xs">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input className="pl-8 h-8 text-sm" placeholder="Title or subject…"
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1 min-w-[130px]">
                  <Label className="text-xs">Class</Label>
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 min-w-[150px]">
                  <Label className="text-xs">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {MATERIAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" className="h-8 self-end text-xs"
                  onClick={() => { setFilterGrade('all'); setFilterType('all'); setSearchTerm(''); }}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Materials List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border rounded-lg bg-slate-50 border-dashed">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No materials found.</p>
              <p className="text-sm mt-1">Upload files using the "Upload New" tab.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[520px]">
              <div className="space-y-2 pr-1">
                {filtered.map(m => (
                  <div key={m._id}
                    className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-medium">{m.grade}</Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(m.type)}`}>
                          {typeLabel(m.type)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.subject && m.subject !== 'General' && <span>{m.subject} · </span>}
                        {m.year && <span>{m.year}</span>}
                        {m.fileSize && <span> · {fmtSize(m.fileSize)}</span>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1"
                        onClick={() => window.open(m.filePath, '_blank')}>
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(m._id, m.title)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseMaterialManagement;
