
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Book, Info, FileQuestion, Calendar } from 'lucide-react';

const policies = [
  {
    id: 1,
    title: "School Handbook",
    description: "Comprehensive guide to school policies, procedures, and expectations for students and parents",
    icon: Book,
    downloadLink: "#"
  },
  {
    id: 2,
    title: "Attendance Policy",
    description: "Guidelines regarding student attendance, tardiness, and leave applications",
    icon: Calendar,
    downloadLink: "#"
  },
  {
    id: 3,
    title: "Code of Conduct",
    description: "Expected behavior standards, disciplinary procedures, and student rights and responsibilities",
    icon: FileText,
    downloadLink: "#"
  },
  {
    id: 4,
    title: "Uniform Guidelines",
    description: "Detailed information about the school uniform requirements for all grades",
    icon: Info,
    downloadLink: "#"
  },
  {
    id: 5,
    title: "Anti-Bullying Policy",
    description: "School's approach to preventing and addressing bullying and harassment",
    icon: FileText,
    downloadLink: "#"
  }
];

const forms = [
  {
    id: 1,
    title: "Admission Application",
    description: "Form for new student admission applications",
    icon: FileText,
    downloadLink: "#"
  },
  {
    id: 2,
    title: "Leave Application",
    description: "Form for requesting leave of absence",
    icon: FileText,
    downloadLink: "#"
  },
  {
    id: 3,
    title: "Medical Certificate Submission",
    description: "Form for submitting medical certificates for health-related absences",
    icon: FileText,
    downloadLink: "#"
  },
  {
    id: 4,
    title: "Transfer Certificate Request",
    description: "Form to request a transfer certificate when leaving the school",
    icon: FileText,
    downloadLink: "#"
  },
  {
    id: 5,
    title: "Scholarship Application",
    description: "Form to apply for available scholarships and financial aid",
    icon: FileText,
    downloadLink: "#"
  }
];

const faqs = [
  {
    id: 1,
    question: "What are the school hours?",
    answer: "School hours are from 8:00 AM to 3:30 PM Monday through Friday, and 8:00 AM to 12:30 PM on Saturdays. The school office is open from 9:00 AM to 4:00 PM on all working days."
  },
  {
    id: 2,
    question: "How do I apply for admission?",
    answer: "To apply for admission, download the admission form from our website or collect it from the school office. Submit the completed form along with required documents and registration fee. Admissions are subject to entrance test and availability of seats."
  },
  {
    id: 3,
    question: "How can I contact my child's teacher?",
    answer: "You can contact teachers through the school diary, email, or by scheduling an appointment through the school office. Teachers are also available during scheduled parent-teacher meetings."
  },
  {
    id: 4,
    question: "What is the school's policy on homework?",
    answer: "Homework is assigned regularly to reinforce classroom learning. The amount varies by grade level, but we aim to ensure it's meaningful and manageable. Parents are encouraged to monitor completion but should allow students to do the work independently."
  },
  {
    id: 5,
    question: "How are student assessments conducted?",
    answer: "Students are assessed through a combination of formative and summative assessments, including class participation, projects, assignments, and formal examinations. We follow the continuous and comprehensive evaluation pattern prescribed by the West Bengal Board."
  },
  {
    id: 6,
    question: "Does the school offer transportation services?",
    answer: "Yes, the school operates bus services covering major routes around the area. Routes and fee details are available from the administrative office."
  },
  {
    id: 7,
    question: "What extracurricular activities are available?",
    answer: "We offer a wide range of extracurricular activities including sports, music, dance, art, debate, science club, eco club, and more. Students are encouraged to participate in these activities for holistic development."
  }
];

const Resources = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">School Resources</h1>
        <p className="text-lg text-muted-foreground">Access important documents, forms, and information about Baliadanga High School</p>
      </div>
      
      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="policies">School Policies</TabsTrigger>
          <TabsTrigger value="forms">Forms & Documents</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="policies" className="mt-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.id} className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 rounded-full bg-school-light p-2 w-10 h-10 flex items-center justify-center text-school-primary">
                    <policy.icon size={20} />
                  </div>
                  <CardTitle className="text-xl">{policy.title}</CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="mt-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="transition-all duration-300 hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 rounded-full bg-school-light p-2 w-10 h-10 flex items-center justify-center text-school-primary">
                    <form.icon size={20} />
                  </div>
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
                    <Download size={16} className="mr-2" /> Download Form
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faqs" className="mt-0">
          <div className="space-y-6">
            <div className="rounded-lg border bg-gray-50 p-6">
              <h3 className="font-heading mb-4 flex items-center text-xl font-bold text-school-primary">
                <FileQuestion size={24} className="mr-2" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.id} className="rounded-md bg-white p-4 shadow-sm">
                    <h4 className="mb-2 text-lg font-semibold">{faq.question}</h4>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Still have questions?</h3>
              <p className="mb-4 text-muted-foreground">
                Feel free to contact our school office if you need more information or have specific queries.
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
                <Button className="bg-school-primary hover:bg-school-dark">
                  <Mail size={16} className="mr-2" />
                  Email Us
                </Button>
                <Button variant="outline" className="border-school-primary text-school-primary hover:bg-school-primary hover:text-white">
                  <Phone size={16} className="mr-2" />
                  Call: +91 9876543210
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
