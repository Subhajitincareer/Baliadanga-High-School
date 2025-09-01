
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Users, GraduationCap, FileText, Award } from 'lucide-react';

const links = [
  {
    title: "Courses & Curriculum",
    description: "Explore our academic offerings",
    icon: BookOpen,
    href: "/courses"
  },
  {
    title: "School Calendar",
    description: "Important dates and events",
    icon: Calendar,
    href: "/events"
  },
  {
    title: "Staff Directory",
    description: "Meet our faculty and staff",
    icon: Users,
    href: "/staff"
  },
  {
    title: "Student Portal",
    description: "Access grades and assignments",
    icon: GraduationCap,
    href: "/portal"
  },
  {
    title: "School Policies",
    description: "Rules, regulations and procedures",
    icon: FileText,
    href: "/resources"
  },
  {
    title: "Achievements",
    description: "Celebrating our successes",
    icon: Award,
    href: "/achievements"
  }
];

const QuickLinksSection = () => {
  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container">
        <h2 className="font-heading mb-8 text-center text-3xl font-bold text-school-primary">Quick Links</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <Link to={link.href} key={index}>
              <Card className="h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="flex items-center p-6 ">
                  <div className="mr-4 rounded-full bg-school-light p-3 text-school-primary">
                    <link.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 ">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection;
