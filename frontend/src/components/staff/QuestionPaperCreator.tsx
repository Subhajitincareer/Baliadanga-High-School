import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Trash2, Printer, ChevronDown, ChevronUp,
  List, AlignLeft, CheckSquare, ToggleLeft, Type, FileQuestion,
  Brain, BookOpenCheck, Calculator, Layers, Lightbulb, SortAsc, Hash,
  Shuffle, Settings2, GripVertical, Languages
} from 'lucide-react';

// ────────────────────── Types ──────────────────────────────────────────────
type QuestionType =
  | 'mcq' | 'multi_select' | 'truefalse' | 'one_word' | 'fill'
  | 'short' | 'long' | 'numerical' | 'match' | 'ordering'
  | 'assertion_reason' | 'comprehension' | 'case_study' | 'diagram';

interface Option { label: string; text: string; }
interface Question {
  id: string; type: QuestionType; text: string; marks: number;
  options: Option[]; blanks: number;
  matchLeft: string[]; matchRight: string[];
  assertion: string; reason: string;
  passage: string; subQuestions: string[];
  orderItems: string[]; formula: string;
  diagramNote: string; answerLines: number;
  orWith?: string; // alternative "OR" question text
  showOr: boolean;
}

interface Section {
  id: string;
  title: string;           // "Section A"
  instruction: string;     // "Answer any 5 of the following"
  numberStyle: 'arabic' | 'roman' | 'alpha'; // 1,2,3 | i,ii,iii | a,b,c
  questions: Question[];
  globalMarks?: number;    // override marks for all Qs in section (0 = per-Q)
  showSectionTotal: boolean;
}

interface PaperMeta {
  school: string; subSchool: string; class: string; section: string;
  subject: string; subjectCode: string; exam: string; date: string;
  time: string; totalMarks: string; teacher: string;
  language: 'english' | 'bengali' | 'hindi' | 'mixed';
  showInstructions: boolean;
  generalInstructions: string[];
}

// ────────────────────── Constants ─────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const TYPE_OPTIONS: { value: QuestionType; label: string; icon: React.ReactNode; group: string }[] = [
  { value: 'mcq',             label: 'MCQ (Single Correct)',     icon: <List className="h-3.5 w-3.5" />,         group: 'Objective' },
  { value: 'multi_select',    label: 'Multi-Select (Tick All)',  icon: <CheckSquare className="h-3.5 w-3.5" />,  group: 'Objective' },
  { value: 'truefalse',       label: 'True / False',             icon: <ToggleLeft className="h-3.5 w-3.5" />,   group: 'Objective' },
  { value: 'one_word',        label: 'One Word / Very Short',    icon: <Hash className="h-3.5 w-3.5" />,         group: 'Objective' },
  { value: 'fill',            label: 'Fill in the Blanks',       icon: <Type className="h-3.5 w-3.5" />,         group: 'Objective' },
  { value: 'assertion_reason',label: 'Assertion-Reason (CBSE)',  icon: <Brain className="h-3.5 w-3.5" />,        group: 'Objective' },
  { value: 'short',           label: 'Short Answer',             icon: <AlignLeft className="h-3.5 w-3.5" />,    group: 'Written' },
  { value: 'long',            label: 'Long Answer / Essay',      icon: <FileQuestion className="h-3.5 w-3.5" />, group: 'Written' },
  { value: 'numerical',       label: 'Numerical / Calculation',  icon: <Calculator className="h-3.5 w-3.5" />,   group: 'Written' },
  { value: 'match',           label: 'Match the Column',         icon: <Shuffle className="h-3.5 w-3.5" />,      group: 'Structured' },
  { value: 'ordering',        label: 'Sequence / Ordering',      icon: <SortAsc className="h-3.5 w-3.5" />,      group: 'Structured' },
  { value: 'comprehension',   label: 'Reading Comprehension',    icon: <BookOpenCheck className="h-3.5 w-3.5" />,group: 'Passage-based' },
  { value: 'case_study',      label: 'Case Study / Situation',   icon: <Layers className="h-3.5 w-3.5" />,       group: 'Passage-based' },
  { value: 'diagram',         label: 'Diagram / Label / Draw',   icon: <Lightbulb className="h-3.5 w-3.5" />,    group: 'Other' },
];

const TYPE_GROUPS = [...new Set(TYPE_OPTIONS.map(t => t.group))];

const DEFAULT_INSTRUCTIONS: Record<string, string[]> = {
  english: [
    'All questions are compulsory unless otherwise stated.',
    'Figures in the margin indicate full marks.',
    'Write the question numbers clearly before answering.',
    'Candidates are required to give their answers in their own words as far as practicable.',
  ],
  bengali: [
    'সমস্ত প্রশ্ন আবশ্যিক, যদি না অন্যথায় বলা হয়।',
    'মার্জিনে দেওয়া সংখ্যা পূর্ণমান নির্দেশ করে।',
    'উত্তর দেওয়ার আগে প্রশ্নের নম্বর স্পষ্টভাবে লিখুন।',
    'যতদূর সম্ভব নিজের ভাষায় উত্তর দিন।',
  ],
  hindi: [
    'सभी प्रश्न अनिवार्य हैं जब तक अन्यथा न कहा जाए।',
    'हाशिये में दिए गए अंक पूर्णांक दर्शाते हैं।',
    'उत्तर लिखने से पहले प्रश्न संख्या स्पष्ट रूप से लिखें।',
  ],
  mixed: [
    'All questions are compulsory. / সমস্ত প্রশ্ন আবশ্যিক।',
    'Figures in margin indicate full marks. / মার্জিনে দেওয়া সংখ্যা পূর্ণমান।',
  ],
};

const SECTION_INSTRUCTION_TEMPLATES = [
  'Answer all questions.',
  'Answer any {N} of the following questions.',
  'Answer any {N} questions from this section.',
  'Attempt all questions. Each question carries {M} marks.',
  'Answer the following questions in brief.',
  'Write detailed answers.',
  'নিচের যেকোনো {N}টি প্রশ্নের উত্তর দাও।',
  'সকল প্রশ্নের উত্তর দিতে হবে।',
  'নিচের প্রশ্নগুলির উত্তর সংক্ষেপে লেখো।',
  'নিম্নলিখিত প্রশ্নগুলির বিস্তারিত উত্তর দাও।',
];

const NUMBER_LABELS = {
  arabic: (n: number) => String(n),
  roman:  (n: number) => ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx'][n-1] || String(n),
  alpha:  (n: number) => String.fromCharCode(96 + n),
};

// ────────────────────── Defaults ──────────────────────────────────────────
const makeQ = (type: QuestionType): Question => ({
  id: uid(), type, text: '', marks: 2, showOr: false,
  options: ['mcq','multi_select'].includes(type)
    ? [{ label:'(a)',text:''},{label:'(b)',text:''},{label:'(c)',text:''},{label:'(d)',text:''}]
    : [],
  blanks: type==='fill'?1:0,
  matchLeft: type==='match'?['','','','']:[],
  matchRight: type==='match'?['','','','']:[],
  assertion:'', reason:'', passage:'',
  subQuestions: ['comprehension','case_study'].includes(type)?['','','']:[],
  orderItems: type==='ordering'?['','','','']:[],
  formula:'', diagramNote:'',
  answerLines: type==='short'?3:type==='long'?7:type==='numerical'?5:2,
});

const makeSection = (): Section => ({
  id: uid(),
  title: 'Section A',
  instruction: 'Answer all questions.',
  numberStyle: 'arabic',
  questions: [makeQ('mcq')],
  globalMarks: 0,
  showSectionTotal: true,
});

// ────────────────────── Print CSS ─────────────────────────────────────────
const PRINT_STYLE = `
/* Hide print area off-screen on screen view — NOT display:none so it stays in DOM */
@media screen {
  #qp-print {
    position: absolute;
    left: -9999px;
    top: 0;
    width: 210mm;
    overflow: hidden;
    height: 0;
    pointer-events: none;
  }
}

/* Print: hide everything, then show only #qp-print */
@media print {
  * { visibility: hidden !important; }
  #qp-print,
  #qp-print * { visibility: visible !important; }
  #qp-print {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    padding: 24px;
    background: white !important;
    font-family: "Times New Roman", serif;
    font-size: 12pt;
    color: #000 !important;
  }
  .no-print { display: none !important; }
}
`;

// ────────────────────── Main Component ────────────────────────────────────
export const QuestionPaperCreator: React.FC = () => {
  const { toast } = useToast();

  const [meta, setMeta] = useState<PaperMeta>({
    school: 'Baliadanga High School', subSchool: '',
    class: '', section: '', subject: '', subjectCode: '',
    exam: '', date: '', time: '3 Hours', totalMarks: '100', teacher: '',
    language: 'english', showInstructions: true,
    generalInstructions: [...DEFAULT_INSTRUCTIONS.english],
  });
  const [sections, setSections] = useState<Section[]>([makeSection()]);
  const [addType, setAddType] = useState<QuestionType>('mcq');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(true);
  const [showInstrEditor, setShowInstrEditor] = useState(false);

  const setM = (k: keyof PaperMeta, v: any) => setMeta(p => ({ ...p, [k]: v }));

  const totalPaperMarks = sections.reduce((sum, sec) =>
    sum + sec.questions.reduce((s, q) => s + (sec.globalMarks || Number(q.marks) || 0), 0), 0);

  // ── Section ops ──
  const addSection = () => {
    const titles = ['Section A','Section B','Section C','Section D','Section E','Section F'];
    setSections(p => [...p, { ...makeSection(), id: uid(), title: titles[p.length] || `Section ${p.length+1}` }]);
  };
  const removeSection = (sid: string) => {
    if (sections.length <= 1) { toast({ title: 'Need at least one section', variant: 'destructive' }); return; }
    setSections(p => p.filter(s => s.id !== sid));
  };
  const updateSection = (sid: string, patch: Partial<Section>) =>
    setSections(p => p.map(s => s.id === sid ? { ...s, ...patch } : s));
  const moveSection = (idx: number, dir: 'up'|'down') => {
    const a = [...sections]; const swap = dir==='up'?idx-1:idx+1;
    if (swap<0||swap>=a.length) return;
    [a[idx],a[swap]]=[a[swap],a[idx]]; setSections(a);
  };

  // ── Question ops ──
  const addQuestion = (sid: string) =>
    setSections(p => p.map(s => s.id!==sid?s:{ ...s, questions:[...s.questions, makeQ(addType)] }));
  const removeQuestion = (sid: string, qid: string) =>
    setSections(p => p.map(s => {
      if (s.id!==sid) return s;
      if (s.questions.length<=1) { toast({ title:'Need at least one question',variant:'destructive'}); return s; }
      return { ...s, questions: s.questions.filter(q=>q.id!==qid) };
    }));
  const updateQ = (sid: string, qid: string, patch: Partial<Question>) =>
    setSections(p => p.map(s => s.id!==sid?s:{ ...s, questions:s.questions.map(q=>q.id===qid?{...q,...patch}:q) }));
  const moveQ = (sid: string, idx: number, dir: 'up'|'down') => {
    setSections(p => p.map(s => {
      if (s.id!==sid) return s;
      const a=[...s.questions]; const swap=dir==='up'?idx-1:idx+1;
      if (swap<0||swap>=a.length) return s;
      [a[idx],a[swap]]=[a[swap],a[idx]]; return {...s,questions:a};
    }));
  };

  // ── Option ops ──
  const updateOption = (sid:string,qid:string,oi:number,text:string) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>{
      if(q.id!==qid)return q; const opts=[...q.options]; opts[oi]={...opts[oi],text}; return{...q,options:opts};
    })}));
  const addOption = (sid:string,qid:string) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>q.id!==qid?q:{
      ...q,options:[...q.options,{label:`(${String.fromCharCode(97+q.options.length)})`,text:''}]
    })}));
  const removeOption = (sid:string,qid:string,oi:number) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>q.id!==qid?q:{
      ...q,options:q.options.filter((_,i)=>i!==oi)
    })}));

  // ── Match ops ──
  const updateMatch = (sid:string,qid:string,side:'matchLeft'|'matchRight',idx:number,val:string) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>{
      if(q.id!==qid)return q; const arr=[...q[side]]; arr[idx]=val; return{...q,[side]:arr};
    })}));
  const addMatchRow = (sid:string,qid:string) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>q.id!==qid?q:{
      ...q,matchLeft:[...q.matchLeft,''],matchRight:[...q.matchRight,'']
    })}));

  // ── Array item ops (subQuestions/orderItems) ──
  const updateArr = (sid:string,qid:string,field:'subQuestions'|'orderItems',idx:number,val:string) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>{
      if(q.id!==qid)return q; const arr=[...q[field]]; arr[idx]=val; return{...q,[field]:arr};
    })}));
  const addArrItem = (sid:string,qid:string,field:'subQuestions'|'orderItems') =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>q.id!==qid?q:{...q,[field]:[...q[field],'']})}));
  const removeArrItem = (sid:string,qid:string,field:'subQuestions'|'orderItems',idx:number) =>
    setSections(p=>p.map(s=>s.id!==sid?s:{...s,questions:s.questions.map(q=>q.id!==qid?q:{...q,[field]:q[field].filter((_,i)=>i!==idx)})}));

  // ── Instruction ops ──
  const addInstruction = () => setM('generalInstructions', [...meta.generalInstructions, '']);
  const updateInstruction = (i:number,val:string) => {
    const a=[...meta.generalInstructions]; a[i]=val; setM('generalInstructions',a);
  };
  const removeInstruction = (i:number) => setM('generalInstructions',meta.generalInstructions.filter((_,idx)=>idx!==i));
  const loadDefaultInstructions = (lang: string) => {
    setM('generalInstructions', [...(DEFAULT_INSTRUCTIONS[lang] || DEFAULT_INSTRUCTIONS.english)]);
  };

  // ── Question body renderer (shared for editor) ──
  const renderQBody = (q: Question, sid: string) => (
    <div className="space-y-3">
      {/* Passage */}
      {(q.type==='comprehension'||q.type==='case_study') && (
        <div className="space-y-1">
          <Label className="text-xs font-semibold">{q.type==='comprehension'?'Passage / Extract':'Case / Situation Description'}</Label>
          <Textarea value={q.passage} onChange={e=>updateQ(sid,q.id,{passage:e.target.value})}
            placeholder="Enter the passage or case study description…" rows={4} className="text-sm bg-blue-50/30" />
        </div>
      )}

      {/* Main question text */}
      <Textarea
        placeholder={
          q.type==='assertion_reason' ? 'Assertion (A): …'
          : (q.type==='comprehension'||q.type==='case_study') ? 'Question instruction (e.g. "Answer the following:")'
          : `Question text…`
        }
        value={q.text} onChange={e=>updateQ(sid,q.id,{text:e.target.value})}
        rows={2} className="text-sm" />

      {/* MCQ / Multi-select */}
      {(q.type==='mcq'||q.type==='multi_select') && (
        <div className="space-y-1.5">
          {q.type==='multi_select'&&<p className="text-xs italic text-muted-foreground">Students tick ALL correct options.</p>}
          {q.options.map((opt,oi)=>(
            <div key={oi} className="flex gap-2 items-center">
              <span className="text-xs w-6 shrink-0 text-muted-foreground">{opt.label}</span>
              <Input value={opt.text} placeholder={`Option ${opt.label}`}
                onChange={e=>updateOption(sid,q.id,oi,e.target.value)} className="h-7 text-sm" />
              {q.options.length>2&&<Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400"
                onClick={()=>removeOption(sid,q.id,oi)}><Trash2 className="h-3 w-3"/></Button>}
            </div>
          ))}
          {q.options.length<8&&<Button variant="outline" size="sm" className="h-7 text-xs" onClick={()=>addOption(sid,q.id)}>
            <Plus className="h-3 w-3 mr-1"/>Add Option</Button>}
        </div>
      )}

      {/* Assertion-Reason */}
      {q.type==='assertion_reason'&&(
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Reason (R):</Label>
            <Textarea value={q.reason} onChange={e=>updateQ(sid,q.id,{reason:e.target.value})}
              placeholder="Reason: …" rows={2} className="text-sm"/>
          </div>
          <p className="text-xs bg-slate-50 p-2 rounded text-muted-foreground">
            Print will auto-add: (a) Both A&R true, R explains A &nbsp;(b) Both true, R doesn't explain &nbsp;(c) A true R false &nbsp;(d) A false R true
          </p>
        </div>
      )}

      {/* Fill in blanks */}
      {q.type==='fill'&&(
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">Number of blank lines:</Label>
          <Input type="number" min={1} max={10} value={q.blanks}
            onChange={e=>updateQ(sid,q.id,{blanks:Number(e.target.value)})} className="h-7 w-16 text-sm"/>
        </div>
      )}

      {/* True/False / One Word */}
      {q.type==='truefalse'&&<p className="text-xs text-muted-foreground italic">Print: [ True ] / [ False ]</p>}
      {q.type==='one_word'&&<p className="text-xs text-muted-foreground italic">Print: one blank line for answer.</p>}

      {/* Sub-questions for comprehension/case_study */}
      {(q.type==='comprehension'||q.type==='case_study')&&(
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Sub-Questions:</Label>
          {q.subQuestions.map((sq,si)=>(
            <div key={si} className="flex gap-2 items-start">
              <span className="text-xs mt-2 w-5 shrink-0 text-muted-foreground">{si+1}.</span>
              <Input value={sq} placeholder={`Sub-question ${si+1}`}
                onChange={e=>updateArr(sid,q.id,'subQuestions',si,e.target.value)} className="h-7 text-sm flex-1"/>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 shrink-0"
                onClick={()=>removeArrItem(sid,q.id,'subQuestions',si)}><Trash2 className="h-3 w-3"/></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs"
            onClick={()=>addArrItem(sid,q.id,'subQuestions')}><Plus className="h-3 w-3 mr-1"/>Add Sub-question</Button>
        </div>
      )}

      {/* Numerical */}
      {q.type==='numerical'&&(
        <Input value={q.formula} onChange={e=>updateQ(sid,q.id,{formula:e.target.value})}
          placeholder="Given / Formula (e.g. F=ma, m=5kg, a=3m/s²)" className="h-7 text-sm"/>
      )}

      {/* Diagram */}
      {q.type==='diagram'&&(
        <div className="space-y-1">
          <Input value={q.diagramNote} onChange={e=>updateQ(sid,q.id,{diagramNote:e.target.value})}
            placeholder="Diagram note (e.g. Label the parts of the human heart)" className="h-8 text-sm"/>
          <p className="text-xs text-muted-foreground">A blank box appears on print for drawing.</p>
        </div>
      )}

      {/* Ordering */}
      {q.type==='ordering'&&(
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Items to Sequence (will be scrambled on print):</Label>
          {q.orderItems.map((item,oi)=>(
            <div key={oi} className="flex gap-2 items-center">
              <span className="text-xs w-4 text-muted-foreground">{oi+1}.</span>
              <Input value={item} placeholder={`Item ${oi+1}`}
                onChange={e=>updateArr(sid,q.id,'orderItems',oi,e.target.value)} className="h-7 text-sm flex-1"/>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400"
                onClick={()=>removeArrItem(sid,q.id,'orderItems',oi)}><Trash2 className="h-3 w-3"/></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs"
            onClick={()=>addArrItem(sid,q.id,'orderItems')}><Plus className="h-3 w-3 mr-1"/>Add Item</Button>
        </div>
      )}

      {/* Match column */}
      {q.type==='match'&&(
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
            <span>Column A</span><span>Column B</span>
          </div>
          {q.matchLeft.map((_,mi)=>(
            <div key={mi} className="grid grid-cols-2 gap-2">
              <Input value={q.matchLeft[mi]} placeholder={`A${mi+1}.`}
                onChange={e=>updateMatch(sid,q.id,'matchLeft',mi,e.target.value)} className="h-7 text-sm"/>
              <Input value={q.matchRight[mi]} placeholder={`B${mi+1}.`}
                onChange={e=>updateMatch(sid,q.id,'matchRight',mi,e.target.value)} className="h-7 text-sm"/>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={()=>addMatchRow(sid,q.id)}>
            <Plus className="h-3 w-3 mr-1"/>Add Row</Button>
        </div>
      )}

      {/* Answer lines */}
      {['short','long','numerical'].includes(q.type)&&(
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">Answer lines on print:</Label>
          <Input type="number" min={1} max={25} value={q.answerLines}
            onChange={e=>updateQ(sid,q.id,{answerLines:Number(e.target.value)})} className="h-7 w-16 text-sm"/>
        </div>
      )}

      {/* OR question toggle */}
      <div className="flex items-center gap-2 pt-1 border-t">
        <Switch checked={q.showOr} onCheckedChange={v=>updateQ(sid,q.id,{showOr:v})}/>
        <Label className="text-xs">Add "OR" alternative question</Label>
      </div>
      {q.showOr&&(
        <Textarea value={q.orWith||''} onChange={e=>updateQ(sid,q.id,{orWith:e.target.value})}
          placeholder="OR: Alternative question text…" rows={2} className="text-sm bg-amber-50/50 border-amber-300"/>
      )}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      <style>{PRINT_STYLE}</style>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 no-print">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-school-primary"/>Question Paper Creator
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={()=>setShowInstrEditor(v=>!v)} className="gap-1">
            <Settings2 className="h-4 w-4"/>Instructions
          </Button>
          <Button onClick={()=>window.print()} className="gap-1">
            <Printer className="h-4 w-4"/>Print / PDF
          </Button>
        </div>
      </div>

      {/* ── Paper Metadata ── */}
      <Card className="no-print">
        <CardHeader className="py-3 cursor-pointer" onClick={()=>setShowMeta(s=>!s)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">📋 Paper Information</CardTitle>
            {showMeta?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}
          </div>
        </CardHeader>
        {showMeta&&(
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                ['school','School Name'],['subSchool','Sub-school / Board'],
                ['class','Class'],['section','Section'],
                ['subject','Subject'],['subjectCode','Subject Code'],
                ['exam','Exam / Test Name'],['date','Date'],
                ['time','Duration'],['totalMarks','Full Marks'],['teacher','Set By (Teacher)'],
              ] as [keyof PaperMeta,string][]).map(([k,lbl])=>(
                <div key={k} className="space-y-1">
                  <Label className="text-xs">{lbl}</Label>
                  <Input value={String(meta[k])} onChange={e=>setM(k,e.target.value)}
                    placeholder={lbl} className="h-8 text-sm"/>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground"/>
                <Label className="text-xs">Medium / Language:</Label>
                <Select value={meta.language} onValueChange={v=>{ setM('language',v); loadDefaultInstructions(v); }}>
                  <SelectTrigger className="w-36 h-8 text-sm"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="mixed">Mixed (Eng+Ben)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={meta.showInstructions} onCheckedChange={v=>setM('showInstructions',v)}/>
                <Label className="text-xs">Show general instructions on print</Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── General Instructions Editor ── */}
      {showInstrEditor&&(
        <Card className="no-print border-blue-200">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-blue-600"/>General Instructions (printed at top)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2 mb-2">
              {(['english','bengali','hindi','mixed'] as const).map(lang=>(
                <Button key={lang} variant="outline" size="sm" className="h-7 text-xs capitalize"
                  onClick={()=>loadDefaultInstructions(lang)}>
                  Load {lang==='bengali'?'Bengali':lang==='hindi'?'Hindi':lang==='mixed'?'Mixed':lang.charAt(0).toUpperCase()+lang.slice(1)} defaults
                </Button>
              ))}
            </div>
            {meta.generalInstructions.map((instr,i)=>(
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-5 shrink-0">{i+1}.</span>
                <Input value={instr} onChange={e=>updateInstruction(i,e.target.value)}
                  className="h-7 text-sm flex-1"/>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400"
                  onClick={()=>removeInstruction(i)}><Trash2 className="h-3 w-3"/></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addInstruction}>
              <Plus className="h-3 w-3 mr-1"/>Add Instruction
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Sections ── */}
      {sections.map((sec, sIdx) => {
        const secTotal = sec.questions.reduce((s,q)=>s+(sec.globalMarks||Number(q.marks)||0),0);
        const isExp = expandedSection===null || expandedSection===sec.id;
        return (
          <div key={sec.id} className="no-print space-y-3">
            {/* Section header */}
            <Card className="border-2 border-school-primary/30 bg-school-primary/5">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0"/>
                    <Input value={sec.title}
                      onChange={e=>updateSection(sec.id,{title:e.target.value})}
                      className="h-7 w-32 text-sm font-bold"/>
                    <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full border">
                      {sec.questions.length} Q · {secTotal} marks
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={()=>moveSection(sIdx,'up')}><ChevronUp className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={()=>moveSection(sIdx,'down')}><ChevronDown className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={()=>removeSection(sec.id)}><Trash2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={()=>setExpandedSection(isExp&&expandedSection===sec.id?null:sec.id)}>
                      {isExp?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}
                    </Button>
                  </div>
                </div>
                {/* Section settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Section Instruction:</Label>
                    <div className="flex gap-1">
                      <Input value={sec.instruction} onChange={e=>updateSection(sec.id,{instruction:e.target.value})}
                        placeholder="e.g. Answer any 5 of the following" className="h-7 text-sm"/>
                      <Select onValueChange={v=>updateSection(sec.id,{instruction:v})}>
                        <SelectTrigger className="w-8 h-7 px-1 shrink-0"><ChevronDown className="h-3 w-3"/></SelectTrigger>
                        <SelectContent>
                          {SECTION_INSTRUCTION_TEMPLATES.map((t,i)=>
                            <SelectItem key={i} value={t} className="text-xs">{t}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Question numbering:</Label>
                    <Select value={sec.numberStyle} onValueChange={v=>updateSection(sec.id,{numberStyle:v as any})}>
                      <SelectTrigger className="h-7 text-sm"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arabic">Arabic (1, 2, 3…)</SelectItem>
                        <SelectItem value="roman">Roman (i, ii, iii…)</SelectItem>
                        <SelectItem value="alpha">Alpha (a, b, c…)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Global marks per Q (0 = per-question):</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} value={sec.globalMarks||0}
                        onChange={e=>updateSection(sec.id,{globalMarks:Number(e.target.value)})}
                        className="h-7 w-16 text-sm"/>
                      <div className="flex items-center gap-1">
                        <Switch checked={sec.showSectionTotal}
                          onCheckedChange={v=>updateSection(sec.id,{showSectionTotal:v})}/>
                        <Label className="text-xs whitespace-nowrap">Show total</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Questions within section */}
            {(isExp||expandedSection===null) && sec.questions.map((q, qIdx) => {
              const typeInfo = TYPE_OPTIONS.find(t=>t.value===q.type);
              const qNum = NUMBER_LABELS[sec.numberStyle](qIdx+1);
              const displayMarks = sec.globalMarks || Number(q.marks);
              return (
                <Card key={q.id} className="ml-4 border-l-4 border-l-school-primary">
                  <CardHeader className="py-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-semibold text-school-primary flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground"/>
                        {qNum}. — {typeInfo?.label}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!sec.globalMarks&&(
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Marks:</Label>
                            <Input type="number" min={0} value={q.marks}
                              onChange={e=>updateQ(sec.id,q.id,{marks:Number(e.target.value)})}
                              className="h-7 w-14 text-sm text-center"/>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">[{displayMarks}]</span>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={()=>moveQ(sec.id,qIdx,'up')}><ChevronUp className="h-3.5 w-3.5"/></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={()=>moveQ(sec.id,qIdx,'down')}><ChevronDown className="h-3.5 w-3.5"/></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={()=>removeQuestion(sec.id,q.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>{renderQBody(q,sec.id)}</CardContent>
                </Card>
              );
            })}

            {/* Add question to section */}
            <div className="ml-4 flex items-center gap-2 flex-wrap">
              <Select value={addType} onValueChange={v=>setAddType(v as QuestionType)}>
                <SelectTrigger className="w-56 h-8 text-sm">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {TYPE_GROUPS.map(grp=>(
                    <React.Fragment key={grp}>
                      <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase bg-slate-50">{grp}</div>
                      {TYPE_OPTIONS.filter(t=>t.group===grp).map(t=>(
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center gap-2">{t.icon}{t.label}</span>
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 gap-1" onClick={()=>addQuestion(sec.id)}>
                <Plus className="h-4 w-4"/>Add Question
              </Button>
            </div>
          </div>
        );
      })}

      {/* Add section + totals bar */}
      <div className="no-print sticky bottom-4 bg-white/90 backdrop-blur border rounded-xl p-3 shadow-md flex items-center gap-3 flex-wrap">
        <Button variant="outline" onClick={addSection} className="h-9 gap-1">
          <Plus className="h-4 w-4"/>Add Section
        </Button>
        <span className="text-sm text-muted-foreground">
          Sections: <strong>{sections.length}</strong> &nbsp;|&nbsp;
          Total Questions: <strong>{sections.reduce((s,sec)=>s+sec.questions.length,0)}</strong> &nbsp;|&nbsp;
          Calculated Marks: <strong className={totalPaperMarks===Number(meta.totalMarks)?'text-green-600':'text-orange-500'}>
            {totalPaperMarks}
          </strong> / {meta.totalMarks||'?'}
        </span>
        <Button onClick={()=>window.print()} className="ml-auto h-9 gap-1">
          <Printer className="h-4 w-4"/>Print
        </Button>
      </div>

      {/* ══════════════════════ PRINTABLE AREA ══════════════════════════════ */}
      <div id="qp-print">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-3">
          {meta.school&&<h1 className="text-xl font-bold uppercase tracking-wide">{meta.school}</h1>}
          {meta.subSchool&&<p className="text-sm">{meta.subSchool}</p>}
          <div className="grid grid-cols-3 text-sm mt-2">
            <div className="text-left">
              {meta.exam&&<div>Exam: <strong>{meta.exam}</strong></div>}
              {meta.subjectCode&&<div>Code: {meta.subjectCode}</div>}
            </div>
            <div className="text-center font-bold text-base">
              {meta.subject}
              {(meta.class||meta.section)&&<div className="text-sm">Class {meta.class}{meta.section&&` — ${meta.section}`}</div>}
            </div>
            <div className="text-right">
              {meta.date&&<div>Date: {meta.date}</div>}
              {meta.time&&<div>Time: {meta.time}</div>}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            {meta.teacher&&<span className="italic">Set by: {meta.teacher}</span>}
            <span className="font-bold">Full Marks: {meta.totalMarks}</span>
          </div>
        </div>

        {/* General Instructions */}
        {meta.showInstructions&&meta.generalInstructions.length>0&&(
          <div className="mb-4 border border-black p-2 text-xs">
            <p className="font-bold underline mb-1">General Instructions / সাধারণ নির্দেশ:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              {meta.generalInstructions.map((instr,i)=><li key={i}>{instr}</li>)}
            </ol>
          </div>
        )}

        {/* Sections */}
        {sections.map((sec, sIdx) => {
          let globalQNum = sections.slice(0,sIdx).reduce((s,prev)=>s+prev.questions.length,0);
          const secTotal = sec.questions.reduce((s,q)=>s+(sec.globalMarks||Number(q.marks)||0),0);
          return (
            <div key={sec.id} className="mb-4">
              {/* Section heading */}
              <div className="text-center font-bold text-sm border-b border-black pb-1 mb-2">
                {sec.title}
                {sec.showSectionTotal&&<span className="ml-3 text-xs font-normal">({secTotal} Marks)</span>}
              </div>
              {sec.instruction&&<p className="text-xs italic text-center mb-2">{sec.instruction}</p>}

              {/* Questions */}
              <ol className="space-y-4 list-none">
                {sec.questions.map((q, qIdx)=>{
                  globalQNum++;
                  const qNum = NUMBER_LABELS[sec.numberStyle](qIdx+1);
                  const displayMarks = sec.globalMarks||Number(q.marks);
                  return (
                    <li key={q.id} className="text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          {/* Passage / Case */}
                          {(q.type==='comprehension'||q.type==='case_study')&&q.passage&&(
                            <div className="border border-gray-400 rounded p-2 mb-2 bg-gray-50 text-xs italic whitespace-pre-wrap">
                              <strong>{q.type==='comprehension'?'Read the following:':'Case Study:'}</strong><br/>{q.passage}
                            </div>
                          )}

                          <p><strong>{qNum}.</strong> {q.text||'(Question text)'}</p>

                          {/* MCQ */}
                          {(q.type==='mcq'||q.type==='multi_select')&&q.options.length>0&&(
                            <div className="ml-4 mt-1 grid grid-cols-2 gap-x-4">
                              {q.options.map((opt,oi)=><p key={oi}>{q.type==='multi_select'?`☐ ${opt.label}`:`${opt.label}`} {opt.text}</p>)}
                            </div>
                          )}

                          {/* True/False */}
                          {q.type==='truefalse'&&<span className="ml-2"> [ True / False ]</span>}
                          {/* One word */}
                          {q.type==='one_word'&&<div className="mt-1 border-b border-black w-48 h-4"/>}
                          {/* Fill */}
                          {q.type==='fill'&&<div className="mt-1 space-y-2">{Array.from({length:q.blanks||1}).map((_,li)=><div key={li} className="border-b border-black w-56 h-4"/>)}</div>}

                          {/* Assertion-Reason */}
                          {q.type==='assertion_reason'&&(
                            <div className="ml-4 mt-1 space-y-0.5 text-xs">
                              <p><strong>R:</strong> {q.reason||'…'}</p>
                              <div className="grid grid-cols-2 gap-x-3 mt-1">
                                <p>(a) Both A&R true; R explains A</p><p>(b) Both true; R doesn't explain</p>
                                <p>(c) A true, R false</p><p>(d) A false, R true</p>
                              </div>
                            </div>
                          )}

                          {/* Comprehension/Case sub-qs */}
                          {(q.type==='comprehension'||q.type==='case_study')&&q.subQuestions.length>0&&(
                            <ol className="ml-4 mt-2 space-y-3 list-none">
                              {q.subQuestions.map((sq,si)=>(
                                <li key={si}>
                                  <p>({String.fromCharCode(97+si)}) {sq}</p>
                                  <div className="mt-1 space-y-2">{Array.from({length:3}).map((_,li)=><div key={li} className="border-b border-gray-400 w-full"/>)}</div>
                                </li>
                              ))}
                            </ol>
                          )}

                          {/* Numerical */}
                          {q.type==='numerical'&&q.formula&&<p className="ml-4 text-xs italic text-gray-600 mt-0.5">Given: {q.formula}</p>}

                          {/* Diagram */}
                          {q.type==='diagram'&&(
                            <div className="mt-1">
                              {q.diagramNote&&<p className="text-xs italic">{q.diagramNote}</p>}
                              <div className="border-2 border-gray-400 rounded mt-1" style={{height:'140px'}}/>
                            </div>
                          )}

                          {/* Ordering */}
                          {q.type==='ordering'&&(
                            <div className="ml-4 mt-1">
                              <p className="text-xs italic mb-1">Arrange in correct order:</p>
                              <div className="grid grid-cols-2 gap-1">
                                {[...q.orderItems].sort(()=>Math.random()-0.5).map((item,oi)=>(
                                  <p key={oi} className="border px-1 py-0.5 rounded text-xs">{item}</p>
                                ))}
                              </div>
                              <div className="mt-1 border-b border-black w-full h-4"/>
                            </div>
                          )}

                          {/* Match */}
                          {q.type==='match'&&(
                            <div className="grid grid-cols-2 gap-6 ml-4 mt-1">
                              <div><p className="font-semibold underline mb-0.5">Column A</p>{q.matchLeft.map((item,mi)=><p key={mi}>{mi+1}. {item}</p>)}</div>
                              <div><p className="font-semibold underline mb-0.5">Column B</p>{q.matchRight.map((item,mi)=><p key={mi}>{['i','ii','iii','iv','v','vi','vii','viii'][mi]}. {item}</p>)}</div>
                            </div>
                          )}

                          {/* Short/Long/Numerical lines */}
                          {['short','long','numerical'].includes(q.type)&&(
                            <div className="mt-2 space-y-3">{Array.from({length:q.answerLines||3}).map((_,li)=><div key={li} className="border-b border-gray-400 w-full"/>)}</div>
                          )}

                          {/* OR */}
                          {q.showOr&&q.orWith&&(
                            <div className="mt-2">
                              <p className="text-center font-bold text-xs">— OR —</p>
                              <p className="mt-1">{q.orWith}</p>
                              {['short','long','numerical'].includes(q.type)&&(
                                <div className="mt-2 space-y-3">{Array.from({length:q.answerLines||3}).map((_,li)=><div key={li} className="border-b border-gray-400 w-full"/>)}</div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="ml-2 font-semibold shrink-0 text-xs">[{displayMarks}]</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-10 border-t-2 border-black pt-2 flex justify-between text-xs text-gray-600">
          <span>*** End of Question Paper ***</span>
          <span>Full Marks: {meta.totalMarks}</span>
        </div>
      </div>
    </div>
  );
};
