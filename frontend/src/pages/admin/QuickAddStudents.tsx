import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, CheckCircle2, Zap, Users, RotateCcw,
  ChevronRight, Pin, Loader2
} from 'lucide-react';
import apiService from '@/services/api';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '@/utils/constants';

// ─── types ────────────────────────────────────────────────────────────────────
interface RecentEntry { name: string; class: string; section: string; roll: string; }

// ─── helpers ─────────────────────────────────────────────────────────────────
const autoEmail = (name: string, roll: string, cls: string) => {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  return `${slug || 'student'}.${cls.toLowerCase()}.${roll}@baliadanga.edu.in`;
};

// ─── component ────────────────────────────────────────────────────────────────
const QuickAddStudents: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Sticky session config (Class / Section don't reset between saves) ──────
  const [sessionClass,   setSessionClass]   = useState('');
  const [sessionSection, setSessionSection] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);

  // ── Per-student fields (reset after each save) ────────────────────────────
  const blankEntry = () => ({ name: '', rollNumber: '', guardianName: '', guardianPhone: '', dateOfBirth: '', gender: 'Male' });
  const [entry, setEntry] = useState(blankEntry());

  // ── Session stats ─────────────────────────────────────────────────────────
  const [addedCount, setAddedCount]   = useState(0);
  const [recentList, setRecentList]   = useState<RecentEntry[]>([]);
  const [saving,     setSaving]       = useState(false);

  // ── Focus name field whenever entry resets ────────────────────────────────
  useEffect(() => {
    if (sessionStarted) nameRef.current?.focus();
  }, [entry.name, sessionStarted]);

  // ── Auto-fill email preview ───────────────────────────────────────────────
  const emailPreview = autoEmail(entry.name, entry.rollNumber, sessionClass);

  const startSession = () => {
    if (!sessionClass || !sessionSection) {
      toast({ title: 'Class ও Section বেছে নিন', variant: 'destructive' });
      return;
    }
    setSessionStarted(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const resetSession = () => {
    setSessionStarted(false);
    setEntry(blankEntry());
    setAddedCount(0);
    setRecentList([]);
    setSessionClass('');
    setSessionSection('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.name.trim() || !entry.rollNumber.trim()) {
      toast({ title: 'নাম ও রোল নম্বর আবশ্যক', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = [{
        name:          entry.name.trim(),
        email:         emailPreview,
        password:      'Student@2025',
        rollNumber:    entry.rollNumber.trim(),
        class:         sessionClass,
        section:       sessionSection,
        guardianName:  entry.guardianName,
        guardianPhone: entry.guardianPhone,
        dateOfBirth:   entry.dateOfBirth,
        gender:        entry.gender,
      }];

      const res = await apiService.bulkImportStudents(payload);

      if (res.results?.successCount > 0) {
        setAddedCount(c => c + 1);
        setRecentList(prev => [
          { name: entry.name, class: sessionClass, section: sessionSection, roll: entry.rollNumber },
          ...prev.slice(0, 4),
        ]);
        // Only reset per-student fields — class/section remain
        setEntry(blankEntry());
        toast({
          title: `✅ ${entry.name} যোগ হয়েছে`,
          description: `Roll: ${entry.rollNumber} | Class ${sessionClass}-${sessionSection}`,
        });
      } else {
        const msg = res.results?.errors?.[0]?.message || 'Student add করা যায়নি';
        throw new Error(msg);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Session config screen ─────────────────────────────────────────────────
  if (!sessionStarted) {
    return (
      <div className="container py-8 max-w-lg mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="border-2 border-school-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle>Quick Entry Mode</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Class ও Section একবার সেট করুন — তারপর পরপর student add করুন।
              প্রতিটি save এর পর form auto-clear হবে।
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Pin className="h-3 w-3" /> Class *</Label>
                <Select value={sessionClass} onValueChange={setSessionClass}>
                  <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Pin className="h-3 w-3" /> Section *</Label>
                <Select value={sessionSection} onValueChange={setSessionSection}>
                  <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 space-y-1">
              <p>📌 Class ও Section পুরো session এ fixed থাকবে।</p>
              <p>🔑 Default password: <strong>Student@2025</strong></p>
              <p>📧 Email auto-generate হবে।</p>
            </div>

            <Button
              className="w-full bg-school-primary hover:bg-school-primary/90 text-white"
              onClick={startSession}
              disabled={!sessionClass || !sessionSection}
            >
              Entry শুরু করুন <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main quick-entry form ─────────────────────────────────────────────────
  return (
    <div className="container py-6 max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-school-primary/10 text-school-primary font-semibold px-3 py-1 rounded-full">
            📌 Class {sessionClass}-{sessionSection}
          </span>
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
            <Users className="h-3 w-3" /> {addedCount} added
          </span>
          <Button variant="outline" size="sm" onClick={resetSession}>
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">নতুন Student — Class {sessionClass} / Section {sessionSection}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Row 1: Name + Roll */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-name">ছাত্রের নাম *</Label>
                <Input
                  id="q-name"
                  ref={nameRef}
                  required
                  value={entry.name}
                  onChange={e => setEntry(f => ({ ...f, name: e.target.value }))}
                  placeholder="যেমন: রাহুল দাস"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-roll">রোল নম্বর *</Label>
                <Input
                  id="q-roll"
                  required
                  value={entry.rollNumber}
                  onChange={e => setEntry(f => ({ ...f, rollNumber: e.target.value }))}
                  placeholder="01"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Email preview (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Auto Email (প্রিভিউ)</Label>
              <div className="text-xs bg-muted px-3 py-2 rounded-md text-muted-foreground font-mono">
                {emailPreview}
              </div>
            </div>

            {/* Row 2: Guardian */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-gname">অভিভাবকের নাম</Label>
                <Input
                  id="q-gname"
                  value={entry.guardianName}
                  onChange={e => setEntry(f => ({ ...f, guardianName: e.target.value }))}
                  placeholder="অভিভাবকের নাম"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-gphone">অভিভাবকের ফোন</Label>
                <Input
                  id="q-gphone"
                  value={entry.guardianPhone}
                  onChange={e => setEntry(f => ({ ...f, guardianPhone: e.target.value }))}
                  placeholder="9876543210"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Row 3: DOB + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-dob">জন্ম তারিখ</Label>
                <Input
                  id="q-dob"
                  type="date"
                  value={entry.dateOfBirth}
                  onChange={e => setEntry(f => ({ ...f, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>লিঙ্গ</Label>
                <Select value={entry.gender} onValueChange={v => setEntry(f => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male (ছেলে)</SelectItem>
                    <SelectItem value="Female">Female (মেয়ে)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-school-primary hover:bg-school-primary/90 text-white font-semibold"
              disabled={saving}
            >
              {saving
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save &amp; Next Student</>
              }
            </Button>
          </form>

          {/* Recent entries feed */}
          {recentList.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">সদ্য যোগ করা:</p>
              <ul className="space-y-1.5">
                {recentList.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground text-xs">Roll {s.roll} · Class {s.class}-{s.section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {addedCount > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          ✅ এই session এ <strong>{addedCount}</strong> জন student যোগ করা হয়েছে।{' '}
          <button className="text-school-primary hover:underline" onClick={() => navigate('/admin/students')}>
            Student List দেখুন →
          </button>
        </p>
      )}
    </div>
  );
};

export default QuickAddStudents;
