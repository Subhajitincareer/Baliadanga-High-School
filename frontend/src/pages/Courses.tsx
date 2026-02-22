import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  ChevronRight, Search, BookOpen, Clock, Award, Users, CheckCircle,
  Download, Printer, FileText, Eye, School, GraduationCap, Puzzle,
  Microscope, Globe, FlaskConical, BookMarked, PenTool
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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


// Booklist Data (Mock)
const bookLists = {
  "Class X": [
    { subject: "Bengali", book: "Sahitya Sanchayan", publisher: "WBBSE" },
    { subject: "English", book: "Bliss", publisher: "WBBSE" },
    { subject: "Mathematics", book: "Ganit Prakash", publisher: "WBBSE" },
    { subject: "Physical Science", book: "Bhoutabigyan O Paribesh", publisher: "Chhaya Prakashani" },
    { subject: "Life Science", book: "Jiban Bigyan", publisher: "Santra Publication" }
  ]
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

// Course Card Component
const CourseCard = ({ course, onViewBooklist, onViewPapers }) => {
  const { toast } = useToast();
  const IconComponent = course.Icon || BookOpen;

  const handleDownloadSyllabus = () => {
    toast({
      title: "Downloading Syllabus...",
      description: `Syllabus for ${course.grade} has been downloaded.`,
    });
  };

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
              {course.subjects.slice(0, 5).map((subject, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-school-light/50 px-2.5 py-1 text-xs font-medium text-school-primary border border-school-light"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-school-primary uppercase tracking-wide">Highlights</h4>
            <ul className="space-y-1.5">
              {course.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-600">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4 bg-slate-50/50 border-t p-4">
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 hover:bg-school-light hover:text-school-primary" onClick={() => onViewBooklist(course.grade)}>
              <BookOpen className="mr-2 h-4 w-4" /> Booklist
            </Button>
            <Button variant="outline" size="sm" className="flex-1 hover:bg-school-light hover:text-school-primary" onClick={() => onViewPapers(course.grade)}>
              <FileText className="mr-2 h-4 w-4" /> Papers
            </Button>
          </div>
          <Button size="sm" className="w-full bg-school-primary hover:bg-school-dark text-white" onClick={handleDownloadSyllabus}>
            <Download className="mr-2 h-4 w-4" /> Download Syllabus
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Courses = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassBooklist, setSelectedClassBooklist] = useState<string | null>(null);
  const [selectedClassPapers, setSelectedClassPapers] = useState<string | null>(null);
  const [viewingPaper, setViewingPaper] = useState<any | null>(null);

  const filterCourses = (courses) => {
    return courses.filter(course =>
      course.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderCourseGrid = (courses) => (
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
              onViewBooklist={setSelectedClassBooklist}
              onViewPapers={setSelectedClassPapers}
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
              <TabsTrigger value="middle" className="rounded-full px-6 py-2 data-[state=active]:bg-school-primary data-[state=active]:text-white transition-all">Middle (VI-VIII)</TabsTrigger>
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

        {/* Booklist Dialog */}
        <Dialog open={!!selectedClassBooklist} onOpenChange={(open) => !open && setSelectedClassBooklist(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-school-primary" />
                Booklist for {selectedClassBooklist}
              </DialogTitle>
              <DialogDescription>
                Recommended books and publishers for the academic year 2025.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedClassBooklist && bookLists[selectedClassBooklist] ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold text-slate-700">Subject</TableHead>
                        <TableHead className="font-bold text-slate-700">Book Name</TableHead>
                        <TableHead className="font-bold text-slate-700">Publisher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookLists[selectedClassBooklist].map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-school-primary">{item.subject}</TableCell>
                          <TableCell>{item.book}</TableCell>
                          <TableCell className="text-slate-500 italic">{item.publisher}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-md border border-dashed">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Booklist details are being updated.</p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print List</Button>
              <Button onClick={() => setSelectedClassBooklist(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exam Papers Dialog */}
        <Dialog open={!!selectedClassPapers} onOpenChange={(open) => !open && setSelectedClassPapers(null)}>
          <DialogContent className="max-w-3xl w-[90vw] md:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-school-primary" />
                Previous Exam Papers - {selectedClassPapers}
              </DialogTitle>
              <DialogDescription>
                Download or read previous year question papers for practice.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <ScrollArea className="h-[300px] w-full pr-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {examPapers.map((paper) => (
                    <div key={paper.id} className="flex flex-col p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="mb-2">
                        <h4 className="font-semibold text-slate-800">{paper.title}</h4>
                        <span className="text-sm text-school-primary font-medium bg-school-light/50 px-2 py-0.5 rounded">{paper.subject}</span>
                        <span className="text-xs text-muted-foreground ml-2">{paper.date}</span>
                      </div>
                      <div className="mt-auto flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewingPaper(paper)}>
                          <Eye className="mr-2 h-3 w-3" /> Read Online
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => {
                          toast({ title: "Downloading...", description: "Paper download started." });
                        }}>
                          <Download className="mr-2 h-3 w-3" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedClassPapers(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Read Online Dialog - Full Screen/Responsive */}
        <Dialog open={!!viewingPaper} onOpenChange={(open) => !open && setViewingPaper(null)}>
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <div>
                <h3 className="font-semibold">{viewingPaper?.title}</h3>
                <p className="text-xs text-muted-foreground">{viewingPaper?.subject}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setViewingPaper(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="flex-grow bg-gray-100 p-4 overflow-auto flex justify-center items-start">
              {/* PDF Placeholder */}
              <div className="bg-white shadow-lg w-full max-w-3xl min-h-full p-8 md:p-12">
                <div className="text-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-serif font-bold text-school-primary mb-2">BALIADANGA HIGH SCHOOL</h2>
                  <h3 className="text-lg font-semibold uppercase">{viewingPaper?.title}</h3>
                  <p className="font-medium">Subject: {viewingPaper?.subject}</p>
                  <div className="flex justify-between mt-4 text-sm font-medium">
                    <span>Full Marks: 100</span>
                    <span>Time: 3 Hours</span>
                  </div>
                </div>

                <div className="space-y-6 font-serif">
                  <div>
                    <p className="font-bold mb-2">Group A (Multiple Choice Questions)</p>
                    <ol className="list-decimal list-inside space-y-2 pl-4">
                      <li>What is the process of photosynthesis?</li>
                      <li>Calculate the area of a circle with radius 7cm.</li>
                      <li>Who wrote 'Gitanjali'?</li>
                      <li>Define Newton's First Law of Motion.</li>
                      <li>Translate into English: "আমি এখন ভাত খাচ্ছি।"</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-bold mb-2">Group B (Short Answer Type)</p>
                    <ol className="list-decimal list-inside space-y-2 pl-4" start={6}>
                      <li>Explain the difference between plant cell and animal cell. (5 marks)</li>
                      <li>Solve the equation: 2x + 5 = 15. (5 marks)</li>
                      <li>Write a short paragraph on 'Global Warming'. (10 marks)</li>
                    </ol>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-center text-sm text-yellow-800">
                    This is a sample viewer. In a real application, the actual PDF file would be rendered here using a PDF viewer library like <code>react-pdf</code>.
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>

        </Dialog>

      </div>
    </div>
  );
};

export default Courses;
