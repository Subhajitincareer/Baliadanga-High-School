import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  ChevronRight, Search, BookOpen, CheckCircle, Users, Award, Clock,
  Download, FileText, Eye,
  GraduationCap, Microscope, Globe, FlaskConical, BookMarked, PenTool,
  Loader2, Lightbulb, Star
} from 'lucide-react';
import apiService, { CourseMaterial } from "@/services/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";



// Mock Data for Exam Papers
const examPapers = [
  { id: 1, title: "Mid-Term Examination 2024", subject: "Mathematics", date: "2024-06-15" },
  { id: 2, title: "Annual Examination 2023", subject: "English", date: "2023-12-10" },
  { id: 3, title: "Unit Test I", subject: "Science", date: "2024-03-20" },
  { id: 4, title: "Mid-Term Examination 2024", subject: "Bengali", date: "2024-06-12" },
];

const middleCourses = [
  {
    id: 5,
    grade: "Class V",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Social Studies", "Computer Science", "Physical Education", "Arts & Craft"],
    description: "Building a strong foundation by transitioning from primary to middle school with broader subject exposure.",
    features: ["Activity-based learning", "Environmental awareness projects", "Foundational science concepts"],
    Icon: BookMarked
  },
  {
    id: 6,
    grade: "Class VI",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Transitioning to specialized subject areas with more in-depth content knowledge.",
    features: ["Subject specialists teaching", "Introduction to laboratories", "Digital learning integration"],
    Icon: Microscope
  },
  {
    id: 7,
    grade: "Class VII",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Developing analytical skills and deeper understanding of scientific and social concepts.",
    features: ["Regular science experiments", "History and geography projects", "Debate and elocution"],
    Icon: Globe
  },
  {
    id: 8,
    grade: "Class VIII",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Preparing students for higher classes with focus on application-based learning.",
    features: ["Career guidance sessions", "Advanced laboratory work", "Life skills education"],
    Icon: FlaskConical
  },
];

const secondaryCourses = [
  {
    id: 9,
    grade: "Class IX",
    subjects: ["Bengali", "English", "Mathematics", "Physical Science", "Life Science", "History", "Geography", "Computer Applications", "Physical Education"],
    description: "Detailed study of subjects as per the State Board curriculum, preparing for Board examination.",
    features: ["Board examination preparation", "Regular assessments", "Career counseling"],
    Icon: PenTool
  },
  {
    id: 10,
    grade: "Class X",
    subjects: ["Bengali", "English", "Mathematics", "Physical Science", "Life Science", "History", "Geography", "Computer Applications", "Physical Education"],
    description: "Final year of secondary education with comprehensive preparation for Board examinations.",
    features: ["Mock examinations", "Specialized doubt clearing sessions", "Stress management workshops"],
    Icon: GraduationCap
  },
];


// Export so CourseMaterialDialog can use it
export const MATERIAL_TYPES: { value: CourseMaterial['type']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'booklist',   label: 'Booklist',       icon: <BookOpen className="h-3.5 w-3.5" />,  color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { value: 'paper',      label: 'Exam Papers',    icon: <FileText className="h-3.5 w-3.5" />,  color: 'text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100' },
  { value: 'syllabus',   label: 'Syllabus',       icon: <Eye className="h-3.5 w-3.5" />,       color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
  { value: 'note',       label: 'Notes',          icon: <Lightbulb className="h-3.5 w-3.5" />, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { value: 'suggestion', label: 'Exam Suggestion',icon: <Star className="h-3.5 w-3.5" />,      color: 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100' },
];

// ── CourseMaterialDialog (view + download only) ──────────────────────────────
const CourseMaterialDialog: React.FC<{
  grade: string | null;
  type: CourseMaterial['type'] | null;
  onClose: () => void;
}> = ({ grade, type, onClose }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const typeInfo = MATERIAL_TYPES.find(t => t.value === type);
  const fmtSize = (b?: number) => !b ? '' : b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/1024/1024).toFixed(1)} MB`;

  useEffect(() => {
    if (grade && type) {
      setLoading(true);
      apiService.getCourseMaterials(grade, type)
        .then(setMaterials)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [grade, type]);

  return (
    <Dialog open={!!(grade && type)} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeInfo?.icon} {typeInfo?.label} — {grade}
          </DialogTitle>
          <DialogDescription>Download available materials for this class.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-school-primary" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No {typeInfo?.label} uploaded yet.</p>
              <p className="text-xs mt-1 text-slate-400">Check back later.</p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {materials.map(m => (
                <div key={m._id}
                  className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.subject && m.subject !== 'General' && <span>{m.subject} · </span>}
                      {m.year && <span>{m.year}</span>}
                      {m.fileSize && <span> · {fmtSize(m.fileSize)}</span>}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0"
                    onClick={() => window.open(m.filePath, '_blank')}>
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// ── CourseCard ────────────────────────────────────────────────────────────────
const CourseCard = ({ course, onOpenMaterial }: {
  course: any;
  onOpenMaterial: (grade: string, type: CourseMaterial['type']) => void;
}) => {
  const IconComponent = course.Icon || BookOpen;
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="h-full">
      <Card className="h-full overflow-hidden border-t-4 border-t-school-primary shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800">{course.grade}</CardTitle>
            <div className="p-2 bg-white rounded-full shadow-sm text-school-primary">
              <IconComponent className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex-grow space-y-4">
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-school-primary uppercase tracking-wide">Core Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {course.subjects.slice(0, 5).map((subject: string, idx: number) => (
                <span key={idx} className="rounded-md bg-school-light/50 px-2.5 py-1 text-xs font-medium text-school-primary border border-school-light">
                  {subject}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-school-primary uppercase tracking-wide">Highlights</h4>
            <ul className="space-y-1.5">
              {course.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        {/* ── Material Buttons ── */}
        <CardFooter className="flex-col gap-2 pt-4 bg-slate-50/50 border-t p-4">
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {MATERIAL_TYPES.map(mt => (
              <Button
                key={mt.value}
                variant="outline"
                size="sm"
                className={`text-xs justify-start gap-1.5 border ${mt.color}`}
                onClick={() => onOpenMaterial(course.grade, mt.value)}
              >
                {mt.icon} {mt.label}
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};


const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialGrade, setMaterialGrade] = useState<string | null>(null);
  const [materialType, setMaterialType] = useState<CourseMaterial['type'] | null>(null);

  const openMaterial = (grade: string, type: CourseMaterial['type']) => {
    setMaterialGrade(grade);
    setMaterialType(type);
  };
  const closeMaterial = () => { setMaterialGrade(null); setMaterialType(null); };

  const filterCourses = (courses: any[]) => {
    return courses.filter(course =>
      course.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjects.some((subject: string) => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderCourseGrid = (courses: any[]) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence>
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpenMaterial={openMaterial}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-12 text-center bg-slate-50 rounded-lg border border-dashed"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-lg text-muted-foreground font-medium">No courses found matching "{searchTerm}"</p>
            <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-school-primary">Clear Search</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Banner Section */}
      <div className="bg-school-primary text-white py-16 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading mb-4 text-4xl md:text-5xl font-bold tracking-tight">
              Academic Excellence
            </h1>
            <p className="text-xl text-white/90 max-w-2xl font-light">
              Explore our comprehensive educational programs designed to nurture, educate, and empower the leaders of tomorrow.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container pb-16">

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="w-full md:w-1/2">
            <SearchInput
              placeholder="Find a class or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 text-lg shadow-sm border-slate-200 focus:border-school-primary"
              icon={Search}
            />
          </div>

          <div className="flex gap-4 md:gap-8 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <BookOpen className="text-school-primary h-5 w-5" />
              <span>State Board Curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-school-primary h-5 w-5" />
              <span>Expert Faculty</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="middle" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white border p-1 h-12 shadow-sm rounded-full">
              <TabsTrigger value="middle" className="rounded-full px-6 py-2 data-[state=active]:bg-school-primary data-[state=active]:text-white transition-all">Middle (V-VIII)</TabsTrigger>
              <TabsTrigger value="secondary" className="rounded-full px-6 py-2 data-[state=active]:bg-school-primary data-[state=active]:text-white transition-all">Secondary (IX-X)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="middle">
            {renderCourseGrid(filterCourses(middleCourses))}
          </TabsContent>

          <TabsContent value="secondary">
            {renderCourseGrid(filterCourses(secondaryCourses))}
          </TabsContent>
        </Tabs>

        {/* Admission Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-school-primary to-blue-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-school-primary" />
                Admission Information
              </CardTitle>
              <CardDescription>
                Join our vibrant learning community. Key details for the 2025 academic session.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Content Same as Before */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" /> Required Documents
                  </h3>
                  <ul className="space-y-3">
                    {["Birth certificate", "Transfer certificate (Class II+)", "Previous Report Card", "Passport Photos", "Residence Proof"].map((item, i) => (
                      <li key={i} className="flex items-center text-slate-700 bg-white p-2 rounded border border-slate-100 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                    <Clock className="h-5 w-5 text-blue-600" /> Key Dates
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Form Out", date: "January 2025" },
                      { label: "Submission", date: "February 2025" },
                      { label: "Entrance Test", date: "March 2025" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded border border-slate-100 shadow-sm">
                        <span className="font-medium text-slate-600">{item.label}</span>
                        <span className="font-bold text-school-primary">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6 flex justify-center">
              <Button size="lg" className="bg-school-primary hover:bg-school-dark shadow-md px-8">
                Contact Admissions Office <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* ── Course Material Dialog ── */}
        <CourseMaterialDialog
          grade={materialGrade}
          type={materialType}
          onClose={closeMaterial}
        />

      </div>
    </div>
  );
};

export default Courses;
