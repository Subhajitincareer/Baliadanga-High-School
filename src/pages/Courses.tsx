import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const courses = {
  junior: [
    {
      id: 1,
      title: "Bengali Language & Literature",
      description: "Foundation course covering reading, writing and basic grammar in Bengali",
      teacherName: "Mr. Rajesh Chatterjee",
      hoursPerWeek: 6,
      subjects: ["Reading Comprehension", "Basic Grammar", "Creative Writing"]
    },
    {
      id: 2,
      title: "English Language",
      description: "Developing proficiency in reading, writing, speaking and listening in English",
      teacherName: "Ms. Priya Sen",
      hoursPerWeek: 6,
      subjects: ["Grammar", "Vocabulary", "Communication Skills"]
    },
    {
      id: 3,
      title: "Mathematics",
      description: "Building mathematical concepts and problem-solving skills",
      teacherName: "Mr. Anand Kumar",
      hoursPerWeek: 6,
      subjects: ["Arithmetic", "Geometry", "Basic Algebra"]
    },
    {
      id: 4,
      title: "Environmental Science",
      description: "Introduction to our environment and scientific principles",
      teacherName: "Ms. Meera Devi",
      hoursPerWeek: 4,
      subjects: ["Living Things", "Earth & Space", "Materials"]
    }
  ],
  middle: [
    {
      id: 1,
      title: "Bengali Language & Literature",
      description: "Advanced study of Bengali literature, grammar and composition",
      teacherName: "Dr. Sudip Banerjee",
      hoursPerWeek: 5,
      subjects: ["Classical Literature", "Advanced Grammar", "Essay Writing"]
    },
    {
      id: 2,
      title: "English Language & Literature",
      description: "Comprehensive study of English through literature and language skills",
      teacherName: "Mr. Robert Thomas",
      hoursPerWeek: 5,
      subjects: ["Prose & Poetry", "Grammar & Usage", "Creative Writing"]
    },
    {
      id: 3,
      title: "Mathematics",
      description: "Developing algebraic reasoning and geometric understanding",
      teacherName: "Mrs. Lakshmi Iyer",
      hoursPerWeek: 6,
      subjects: ["Algebra", "Geometry", "Statistics"]
    },
    {
      id: 4,
      title: "Science",
      description: "Integrated approach to physics, chemistry and biology",
      teacherName: "Mr. Alok Sharma",
      hoursPerWeek: 6,
      subjects: ["Physics", "Chemistry", "Biology"]
    },
    {
      id: 5,
      title: "Social Studies",
      description: "Exploration of history, geography, and civics",
      teacherName: "Ms. Parvati Ghosh",
      hoursPerWeek: 5,
      subjects: ["History", "Geography", "Civics"]
    }
  ],
  senior: [
    {
      id: 1,
      title: "Bengali Language & Literature",
      description: "Critical study of Bengali literature and advanced composition",
      teacherName: "Dr. Sudip Banerjee",
      hoursPerWeek: 5,
      subjects: ["Modern Literature", "Literary Analysis", "Advanced Composition"]
    },
    {
      id: 2,
      title: "English Language & Literature",
      description: "Advanced study of English literature and language skills",
      teacherName: "Mrs. Elizabeth Davies",
      hoursPerWeek: 5,
      subjects: ["British Literature", "American Literature", "Academic Writing"]
    },
    {
      id: 3,
      title: "Mathematics",
      description: "Higher mathematics preparing students for college and careers",
      teacherName: "Dr. Ramesh Chandra",
      hoursPerWeek: 6,
      subjects: ["Advanced Algebra", "Calculus", "Statistics"]
    },
    {
      id: 4,
      title: "Physics",
      description: "Study of matter, energy and their interactions",
      teacherName: "Mr. Vinod Kumar",
      hoursPerWeek: 4,
      subjects: ["Mechanics", "Electricity & Magnetism", "Modern Physics"]
    },
    {
      id: 5,
      title: "Chemistry",
      description: "Study of substances, their properties and reactions",
      teacherName: "Mrs. Sunita Dey",
      hoursPerWeek: 4,
      subjects: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"]
    },
    {
      id: 6,
      title: "Biology",
      description: "Study of living organisms and their interactions",
      teacherName: "Dr. Anjali Mishra",
      hoursPerWeek: 4,
      subjects: ["Botany", "Zoology", "Human Physiology"]
    },
    {
      id: 7,
      title: "Computer Science",
      description: "Introduction to computer systems and programming",
      teacherName: "Mr. Sanjay Gupta",
      hoursPerWeek: 4,
      subjects: ["Computer Fundamentals", "Programming", "Applications"]
    }
  ]
};

const CourseCard = ({ course, onViewSyllabus }) => {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-school-primary">{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2" />
            <span>Teacher: {course.teacherName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>{course.hoursPerWeek} hours per week</span>
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Key Topics:</h4>
          <ul className="list-inside list-disc space-y-1 pl-2 text-sm text-gray-600">
            {course.subjects.map((subject, index) => (
              <li key={index}>{subject}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
          onClick={() => onViewSyllabus(course)}
        >
          View Syllabus
        </Button>
      </CardFooter>
    </Card>
  );
};

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewSyllabus = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Courses & Curriculum</h1>
        <p className="text-lg text-muted-foreground">Explore our academic offerings and comprehensive curriculum</p>
      </div>

      <Tabs defaultValue="middle" className="w-full">
        <TabsList className="mb-8 flex flex-col gap-2 sm:grid sm:grid-cols-3">
          <TabsTrigger value="junior">Junior Section (Classes 1-5)</TabsTrigger>
          <TabsTrigger value="middle">Middle Section (Classes 6-8)</TabsTrigger>
          <TabsTrigger value="senior">Senior Section (Classes 9-10)</TabsTrigger>
        </TabsList>

        <TabsContent value="junior" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.junior.map((course) => (
              <CourseCard key={course.id} course={course} onViewSyllabus={handleViewSyllabus} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="middle" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.middle.map((course) => (
              <CourseCard key={course.id} course={course} onViewSyllabus={handleViewSyllabus} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="senior" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.senior.map((course) => (
              <CourseCard key={course.id} course={course} onViewSyllabus={handleViewSyllabus} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal for Syllabus */}
      {isModalOpen && selectedCourse && (
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCourse.title} - Syllabus</DialogTitle>
              <DialogDescription>{selectedCourse.description}</DialogDescription>
            </DialogHeader>
            <div>
              <h4 className="mb-2 font-semibold">Key Topics:</h4>
              <ul className="list-inside list-disc space-y-1 pl-2 text-sm text-gray-600">
                {selectedCourse.subjects.map((subject, index) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-12 rounded-lg bg-school-light p-6">
        <h3 className="font-heading mb-4 text-2xl font-bold text-school-primary">Curriculum Philosophy</h3>
        <p className="mb-4">
          At Baliadanga High School, we follow a holistic curriculum designed to develop the intellectual, physical, emotional, and social capabilities of our students. Our curriculum is aligned with the West Bengal Board of Secondary Education while incorporating modern teaching methodologies and global educational practices.
        </p>
        <p>
          We emphasize critical thinking, problem-solving, creativity, and character development along with academic excellence. Our aim is to prepare students not just for examinations, but for life and future challenges in a rapidly changing world.
        </p>
      </div>
    </div>
  );
};

export default Courses;
