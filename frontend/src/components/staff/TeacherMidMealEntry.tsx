import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, CheckCircle, Loader2, Utensils, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CLASS_LIST = ['5', '6', '7', '8', '9', '10', '11', '12'];
const SECTION_LIST = ['A', 'B', 'C', 'D'];

const today = () => new Date().toISOString().split('T')[0];

// Composite key: class-section
const key = (cls: string, sec: string) => `${cls}-${sec}`;

interface RowState { count: string; saving: boolean; saved: boolean; }

const TeacherMidMealEntry: React.FC = () => {
  const { toast } = useToast();
  const [date] = useState(today());
  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    CLASS_LIST.forEach(cls =>
      SECTION_LIST.forEach(sec => { init[key(cls, sec)] = { count: '', saving: false, saved: false }; })
    );
    return init;
  });
  const [loadingInitial, setLoadingInitial] = useState(true);

  const loadExisting = async () => {
    try {
      const res = await fetch(`${API_BASE}/mid-day-meal/daily-summary?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setRows(prev => {
          const updated = { ...prev };
          json.data.forEach((cls: any) => {
            cls.sections.forEach((sec: any) => {
              const k = key(cls.class, sec.section);
              if (updated[k]) {
                updated[k] = { count: String(sec.count), saving: false, saved: false };
              }
            });
          });
          return updated;
        });
      }
    } catch { /* ignore */ }
    finally { setLoadingInitial(false); }
  };

  useEffect(() => { loadExisting(); }, []);

  const saveRow = async (cls: string, sec: string) => {
    const k = key(cls, sec);
    const countStr = rows[k].count;
    if (countStr === '' || isNaN(Number(countStr))) {
      toast({ title: 'Invalid count', description: 'Please enter a valid number', variant: 'destructive' });
      return;
    }
    setRows(prev => ({ ...prev, [k]: { ...prev[k], saving: true } }));
    try {
      const res = await fetch(`${API_BASE}/mid-day-meal/count`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, className: cls, section: sec, count: Number(countStr) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save failed');
      setRows(prev => ({ ...prev, [k]: { ...prev[k], saving: false, saved: true } }));
      setTimeout(() => setRows(prev => ({ ...prev, [k]: { ...prev[k], saved: false } })), 3000);
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
      setRows(prev => ({ ...prev, [k]: { ...prev[k], saving: false } }));
    }
  };

  // Grand total across all entered
  const grandTotal = CLASS_LIST.reduce((sum, cls) =>
    sum + SECTION_LIST.reduce((s, sec) => s + (Number(rows[key(cls, sec)].count) || 0), 0), 0);

  // Per-class subtotal
  const classTotal = (cls: string) =>
    SECTION_LIST.reduce((s, sec) => s + (Number(rows[key(cls, sec)].count) || 0), 0);

  if (loadingInitial) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading today's meal counts…
      </div>
    );
  }

  return (
    <Card className="border-orange-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-4 w-4 text-orange-500" />
            মিড-ডে মিল এন্ট্রি — {date}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              মোট: {grandTotal}
            </span>
            <Button variant="outline" size="sm" onClick={loadExisting} className="h-7 px-2">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-700 w-20">Class</th>
                {SECTION_LIST.map(sec => (
                  <th key={sec} className="px-2 py-2 text-center font-semibold text-orange-700">
                    Section {sec}
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-semibold text-orange-700 bg-orange-100">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CLASS_LIST.map((cls, ci) => (
                <tr key={cls} className={ci % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-3 py-2 font-bold text-school-primary">Class {cls}</td>
                  {SECTION_LIST.map(sec => {
                    const k = key(cls, sec);
                    const row = rows[k];
                    return (
                      <td key={sec} className="px-2 py-1.5">
                        <div className="flex gap-1 items-center min-w-[80px]">
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={row.count}
                            onChange={e => setRows(prev => ({
                              ...prev,
                              [k]: { ...prev[k], count: e.target.value, saved: false }
                            }))}
                            onKeyDown={e => { if (e.key === 'Enter') saveRow(cls, sec); }}
                            className="h-7 text-sm text-center px-1 w-16"
                          />
                          <Button
                            size="sm"
                            variant={row.saved ? 'default' : 'outline'}
                            className={`h-7 w-7 p-0 shrink-0 ${row.saved ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
                            onClick={() => saveRow(cls, sec)}
                            disabled={row.saving}
                            title={`Save Class ${cls} - Section ${sec}`}
                          >
                            {row.saving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : row.saved ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                    );
                  })}
                  {/* Class subtotal */}
                  <td className="px-3 py-2 text-center font-bold text-school-primary bg-orange-50">
                    {classTotal(cls) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-orange-100">
              <tr>
                <td className="px-3 py-2 font-bold text-orange-800">সর্বমোট</td>
                {SECTION_LIST.map(sec => {
                  const secTotal = CLASS_LIST.reduce((s, cls) => s + (Number(rows[key(cls, sec)].count) || 0), 0);
                  return (
                    <td key={sec} className="px-2 py-2 text-center font-semibold text-orange-700">
                      {secTotal || '—'}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-extrabold text-orange-800 text-lg">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-muted-foreground px-4 py-2 border-t">
          সংখ্যা দিন → 💾 Save বাটন চাপুন (বা Enter)। সারাদিন যেকোনো সময় আপডেট করা যাবে।
        </p>
      </CardContent>
    </Card>
  );
};

export default TeacherMidMealEntry;
