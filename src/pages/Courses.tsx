
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronRight, Search, BookOpen, Clock, Award, Users, CheckCircle } from 'lucide-react';

const primaryCourses = [
  {
    id: 1,
    grade: "Class I",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Drawing", "Physical Education"],
    description: "Foundation course focusing on basic literacy, numeracy and environmental awareness.",
    features: ["Age-appropriate learning", "Activity-based teaching", "Regular parent-teacher interaction"],
    icon: "🏫"
  },
  {
    id: 2,
    grade: "Class II",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Drawing", "Physical Education"],
    description: "Building on foundational knowledge with more complex concepts and language skills.",
    features: ["Progressive learning approach", "Basic computer awareness", "Value education"],
    icon: "📚"
  },
  {
    id: 3,
    grade: "Class III",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Computer Awareness", "Arts", "Physical Education"],
    description: "Introducing more structured learning with enhanced focus on languages and mathematics.",
    features: ["Introduction to computers", "Regular field trips", "Group projects"],
    icon: "🧩"
  },
  {
    id: 4,
    grade: "Class IV",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Computer Education", "Arts", "Physical Education"],
    description: "Developing critical thinking skills through more advanced concepts and activities.",
    features: ["Public speaking activities", "Science experiments", "Educational excursions"],
    icon: "🔍"
  },
  {
    id: 5,
    grade: "Class V",
    subjects: ["Bengali", "English", "Mathematics", "Environmental Science", "Computer Education", "Arts", "Physical Education"],
    description: "Preparing students for middle school with comprehensive conceptual understanding.",
    features: ["Project-based learning", "Basic coding introduction", "Leadership activities"],
    icon: "🌟"
  },
];

const middleCourses = [
  {
    id: 6,
    grade: "Class VI",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Transitioning to specialized subject areas with more in-depth content knowledge.",
    features: ["Subject specialists teaching", "Introduction to laboratories", "Digital learning integration"],
    icon: "🔬"
  },
  {
    id: 7,
    grade: "Class VII",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Developing analytical skills and deeper understanding of scientific and social concepts.",
    features: ["Regular science experiments", "History and geography projects", "Debate and elocution"],
    icon: "🌎"
  },
  {
    id: 8,
    grade: "Class VIII",
    subjects: ["Bengali", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Arts"],
    description: "Preparing students for higher classes with focus on application-based learning.",
    features: ["Career guidance sessions", "Advanced laboratory work", "Life skills education"],
    icon: "⚗️"
  },
];

const secondaryCourses = [
  {
    id: 9,
    grade: "Class IX",
    subjects: ["Bengali", "English", "Mathematics", "Physical Science", "Life Science", "History", "Geography", "Computer Applications", "Physical Education"],
    description: "Detailed study of subjects as per the State Board curriculum, preparing for Board examination.",
    features: ["Board examination preparation", "Regular assessments", "Career counseling"],
    icon: "📝"
  },
  {
    id: 10,
    grade: "Class X",
    subjects: ["Bengali", "English", "Mathematics", "Physical Science", "Life Science", "History", "Geography", "Computer Applications", "Physical Education"],
    description: "Final year of secondary education with comprehensive preparation for Board examinations.",
    features: ["Mock examinations", "Specialized doubt clearing sessions", "Stress management workshops"],
    icon: "🎓"
  },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filterCourses = (courses) => {
    return courses.filter(course => 
      course.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">
          Academic Curriculum
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore our comprehensive educational programs from primary to secondary levels
        </p>
      </div>
      
      <div className="mb-8">
        <SearchInput
          placeholder="Search classes, subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          icon={Search}
        />
      </div>
      
      <div className="mb-12 grid gap-8 md:grid-cols-4">
        <Card className="md:col-span-1 bg-school-light border-0">
          <CardHeader>
            <div className="h-16 w-16 rounded-full bg-school-primary/20 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-school-primary" />
            </div>
            <CardTitle>Comprehensive Curriculum</CardTitle>
            <CardDescription>
              Well-balanced academic program following state board guidelines
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="md:col-span-1 bg-school-light border-0">
          <CardHeader>
            <div className="h-16 w-16 rounded-full bg-school-primary/20 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-school-primary" />
            </div>
            <CardTitle>Structured Learning</CardTitle>
            <CardDescription>
              Organized approach to education with regular assessments
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="md:col-span-1 bg-school-light border-0">
          <CardHeader>
            <div className="h-16 w-16 rounded-full bg-school-primary/20 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-school-primary" />
            </div>
            <CardTitle>Academic Excellence</CardTitle>
            <CardDescription>
              Focus on high-quality education and measurable outcomes
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="md:col-span-1 bg-school-light border-0">
          <CardHeader>
            <div className="h-16 w-16 rounded-full bg-school-primary/20 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-school-primary" />
            </div>
            <CardTitle>Experienced Faculty</CardTitle>
            <CardDescription>
              Qualified teachers dedicated to student growth and learning
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="primary">
        <TabsList className="mb-6">
          <TabsTrigger value="primary">Primary (I-V)</TabsTrigger>
          <TabsTrigger value="middle">Middle (VI-VIII)</TabsTrigger>
          <TabsTrigger value="secondary">Secondary (IX-X)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="primary">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterCourses(primaryCourses).length > 0 ? (
              filterCourses(primaryCourses).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <p className="text-muted-foreground">No courses match your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="middle">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterCourses(middleCourses).length > 0 ? (
              filterCourses(middleCourses).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <p className="text-muted-foreground">No courses match your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="secondary">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterCourses(secondaryCourses).length > 0 ? (
              filterCourses(secondaryCourses).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <p className="text-muted-foreground">No courses match your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-12 border-t-4 border-t-school-primary">
        <CardHeader>
          <CardTitle>Admission Information</CardTitle>
          <CardDescription>
            Learn about our admission process and requirements for new students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Baliadanga High School welcomes applications for all classes subject to seat availability. 
            Admission tests are conducted for classes II and above, while Class I admission is based on an 
            interview and interaction with the child and parents.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Required Documents</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Birth certificate</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Transfer certificate (for classes II and above)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Report card of previous academic year</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Passport size photographs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Residence proof</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Application Timeline</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Form availability: January</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Submission deadline: February</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Entrance tests/interviews: March</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Results announcement: March end</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Fee payment deadline: April first week</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-school-primary hover:bg-school-primary/90">
            Contact Admissions Office
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="border-b bg-muted/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{course.grade}</CardTitle>
          <span className="text-2xl">{course.icon}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="mb-4 text-muted-foreground">{course.description}</p>
        
        <div className="mb-4">
          <h4 className="mb-2 font-medium">Core Subjects:</h4>
          <div className="flex flex-wrap gap-2">
            {course.subjects.map((subject, idx) => (
              <span 
                key={idx}
                className="rounded-full bg-school-light px-3 py-1 text-xs font-medium text-school-primary"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="mb-2 font-medium">Key Features:</h4>
          <ul className="space-y-1">
            {course.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-sm">
                <ChevronRight className="mr-1 h-3 w-3 text-school-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default Courses;
