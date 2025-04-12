
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { School, FileText, Award, User, Users, Calendar, UserPlus, LogIn } from 'lucide-react';

const Portal = () => {
  const portalLinks = [
    {
      title: 'Student Admission',
      description: 'Apply for admission or check application status',
      icon: <School className="h-8 w-8 text-blue-500" />,
      links: [
        { text: 'Apply Now', url: '/admission' },
        { text: 'Check Status', url: '/admission-status' }
      ],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Student Access',
      description: 'Login or register to access your student dashboard',
      icon: <User className="h-8 w-8 text-violet-500" />,
      links: [
        { text: 'Login', url: '/student/login' },
        { text: 'Register', url: '/student/login?tab=register' }
      ],
      color: 'bg-violet-50 border-violet-200'
    },
    {
      title: 'Examination Results',
      description: 'Check your examination results online',
      icon: <Award className="h-8 w-8 text-green-500" />,
      links: [
        { text: 'View Results', url: '/results' }
      ],
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'School News & Notices',
      description: 'Stay updated with the latest announcements',
      icon: <FileText className="h-8 w-8 text-amber-500" />,
      links: [
        { text: 'Announcements', url: '/announcements' },
        { text: 'Events', url: '/events' }
      ],
      color: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'Academic Resources',
      description: 'Access study materials and academic resources',
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      links: [
        { text: 'Calendar', url: '/academic-calendar' },
        { text: 'Resources', url: '/resources' }
      ],
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Faculty Directory',
      description: 'Connect with our teachers and staff',
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      links: [
        { text: 'View Staff', url: '/staff' }
      ],
      color: 'bg-indigo-50 border-indigo-200'
    },
  ];

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Student & Parent Portal</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access school resources, check academic information, and stay connected with Baliadanga High School
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portalLinks.map((portal, index) => (
          <Card key={index} className={`${portal.color} transition-all hover:shadow-md`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {portal.icon}
                <CardTitle>{portal.title}</CardTitle>
              </div>
              <CardDescription>{portal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {portal.links.map((link, linkIndex) => (
                  link.url === '#' ? (
                    <div key={linkIndex} className="text-muted-foreground italic text-sm flex items-center">
                      {link.text} <span className="text-xs ml-1 px-1 bg-gray-100 rounded">Soon</span>
                    </div>
                  ) : (
                    <Link 
                      key={linkIndex}
                      to={link.url}
                      className="bg-white p-2 rounded border hover:shadow-sm transition-shadow text-center"
                    >
                      {link.text}
                    </Link>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Portal;
