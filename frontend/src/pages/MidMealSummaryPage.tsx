import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Printer, Utensils, CalendarDays, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SectionEntry { section: string; count: number; menu: string; }
interface ClassEntry   { class: string; sections: SectionEntry[]; classTotal: number; }

const CLASSES = ['5','6','7','8','9','10','11','12'];

const today = () => new Date().toISOString().split('T')[0];

const MidMealSummaryPage: React.FC = () => {
  const [date, setDate]       = useState(today());
  const [data, setData]       = useState<ClassEntry[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchSummary = async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mid-day-meal/daily-summary?date=${d}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
        setGrandTotal(json.grandTotal || 0);
        setLastUpdated(new Date());
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchSummary(date);
    const id = setInterval(() => { if (date === today()) fetchSummary(date); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [date]);

  const handlePrint = () => window.print();

  // Build a full class list (show 0 for classes with no data)
  const classMap: Record<string, ClassEntry> = {};
  data.forEach(d => { classMap[d.class] = d; });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #mid-meal-print, #mid-meal-print * { visibility: visible; }
          #mid-meal-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 no-print">
          <div className="inline-flex items-center gap-2 bg-school-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
            <Utensils className="h-4 w-4" /> Daily Mid-Day Meal Register
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">
            মিড-ডে মিল সারসংক্ষেপ
          </h1>
          <p className="text-muted-foreground mt-1">Daily meal count — auto-refreshes every 5 minutes</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 no-print">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              max={today()}
              onChange={e => setDate(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-school-primary"
            />
            <Button variant="outline" size="sm" onClick={() => fetchSummary(date)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
            </Button>
          </div>
          <Button size="sm" onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Printable table */}
        <div id="mid-meal-print" ref={printRef}>
          {/* Print header */}
          <div className="hidden print:block text-center mb-6">
            <h2 className="text-2xl font-bold">Baliadanga High School</h2>
            <p className="text-lg">Mid-Day Meal Register — {date}</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-4 border-school-primary border-t-transparent rounded-full mx-auto mb-3" />
              Loading…
            </div>
          ) : (
            <>
              {/* Grand Total Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-school-primary text-white rounded-2xl p-6 mb-6 text-center shadow-lg"
              >
                <p className="text-sm uppercase tracking-wide opacity-80 mb-1">আজকের মোট মিড-ডে মিল গ্রহীতা</p>
                <p className="text-6xl font-extrabold">{grandTotal}</p>
                <p className="text-sm opacity-70 mt-1">{date}</p>
                {lastUpdated && (
                  <p className="text-xs opacity-60 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </motion.div>

              {/* Class-wise table */}
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-school-primary/10">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-school-primary">শ্রেণী (Class)</th>
                      <th className="px-4 py-3 text-left font-semibold text-school-primary">বিভাগ (Section)</th>
                      <th className="px-4 py-3 text-center font-semibold text-school-primary">মেনু (Menu)</th>
                      <th className="px-4 py-3 text-center font-semibold text-school-primary">সংখ্যা (Count)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASSES.map((cls, ci) => {
                      const entry = classMap[cls];
                      if (!entry) {
                        return (
                          <tr key={cls} className={ci % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 font-medium">Class {cls}</td>
                            <td className="px-4 py-3 text-muted-foreground">—</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">—</td>
                            <td className="px-4 py-3 text-center text-muted-foreground font-semibold">0</td>
                          </tr>
                        );
                      }
                      return entry.sections.map((sec, si) => (
                        <tr key={`${cls}-${si}`} className={(ci + si) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {si === 0 && (
                            <td rowSpan={entry.sections.length} className="px-4 py-3 font-bold text-school-primary align-middle border-r">
                              Class {cls}
                              <span className="ml-2 text-xs bg-school-primary text-white rounded-full px-2 py-0.5">
                                {entry.classTotal}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3">{sec.section}</td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">{sec.menu}</td>
                          <td className="px-4 py-3 text-center font-bold text-lg text-school-primary">{sec.count}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                  <tfoot className="bg-school-primary text-white">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-semibold text-right">সর্বমোট (Grand Total):</td>
                      <td className="px-4 py-3 text-center font-extrabold text-2xl">{grandTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {CLASSES.every(cls => !classMap[cls]) && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>আজকের কোনো মিল রেকর্ড নেই। শিক্ষকরা তাদের ড্যাশবোর্ড থেকে এন্ট্রি দিতে পারবেন।</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MidMealSummaryPage;
