
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Phone } from 'lucide-react';

const staffMembers = {
  administration: [
    {
      id: 1,
      name: "Dr. Arun Mukherjee",
      position: "Principal",
      email: "principal@baliadangahs.edu",
      phone: "+91 9876543210",
      qualification: "Ph.D. in Education Administration",
      bio: "Dr. Mukherjee has been leading Baliadanga High School for 8 years. With over 25 years in education, he's committed to excellence and holistic development.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: 2,
      name: "Mrs. Mamata Roy",
      position: "Vice Principal",
      email: "viceprincipal@baliadangahs.edu",
      phone: "+91 9876543211",
      qualification: "M.Ed, M.A. English",
      bio: "Mrs. Roy oversees academic affairs and student development. She has served at Baliadanga High School for 15 years and is passionate about quality education.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: 3,
      name: "Mr. Debashish Dutta",
      position: "Administrative Officer",
      email: "admin@baliadangahs.edu",
      phone: "+91 9876543212",
      qualification: "M.B.A. in Education Management",
      bio: "Mr. Dutta manages the administrative functions of the school, ensuring smooth operations and proper resource allocation for all school activities.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    }
  ],
  teaching: [
    {
      id: 1,
      name: "Dr. Sudip Banerjee",
      position: "Senior Bengali Teacher",
      email: "sudip.b@baliadangahs.edu",
      phone: "+91 9876543213",
      qualification: "Ph.D. in Bengali Literature",
      bio: "Dr. Banerjee is an expert in Bengali literature with over 20 years of teaching experience. He has authored several textbooks and is committed to preserving the richness of Bengali language.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      name: "Mrs. Elizabeth Davies",
      position: "Senior English Teacher",
      email: "elizabeth.d@baliadangahs.edu",
      phone: "+91 9876543214",
      qualification: "M.A. in English Literature",
      bio: "Mrs. Davies brings international experience to our English department. She focuses on developing strong communication skills and a love for literature among students.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
    },
    {
      id: 3,
      name: "Dr. Ramesh Chandra",
      position: "Senior Mathematics Teacher",
      email: "ramesh.c@baliadangahs.edu",
      phone: "+91 9876543215",
      qualification: "Ph.D. in Mathematics",
      bio: "Dr. Chandra makes mathematics accessible and engaging for all students. His innovative teaching methods have consistently resulted in excellent student performance.",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 4,
      name: "Mr. Vinod Kumar",
      position: "Physics Teacher",
      email: "vinod.k@baliadangahs.edu",
      phone: "+91 9876543216",
      qualification: "M.Sc. in Physics",
      bio: "Mr. Kumar makes physics concepts come alive through practical demonstrations and real-world applications. His students consistently achieve top results in board examinations.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: 5,
      name: "Mrs. Sunita Dey",
      position: "Chemistry Teacher",
      email: "sunita.d@baliadangahs.edu",
      phone: "+91 9876543217",
      qualification: "M.Sc. in Chemistry",
      bio: "Mrs. Dey ensures chemistry is taught with a focus on both theoretical knowledge and practical applications. She organizes regular lab activities to enhance student learning.",
      image: "https://images.unsplash.com/photo-1580894732930-0babd100d356?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 6,
      name: "Dr. Anjali Mishra",
      position: "Biology Teacher",
      email: "anjali.m@baliadangahs.edu",
      phone: "+91 9876543218",
      qualification: "Ph.D. in Biological Sciences",
      bio: "Dr. Mishra brings biology to life through her engaging teaching style and extensive knowledge. She organizes field trips and practical sessions to enhance student learning.",
      image: "https://images.unsplash.com/photo-1564460576398-ef55d99548b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    }
  ],
  support: [
    {
      id: 1,
      name: "Ms. Priyanka Das",
      position: "School Counselor",
      email: "counselor@baliadangahs.edu",
      phone: "+91 9876543219",
      qualification: "M.A. in Counseling Psychology",
      bio: "Ms. Das provides emotional and psychological support to students, helping them navigate academic and personal challenges with confidence and resilience.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80"
    },
    {
      id: 2,
      name: "Mr. Rajiv Singh",
      position: "Physical Education Teacher",
      email: "sports@baliadangahs.edu",
      phone: "+91 9876543220",
      qualification: "B.P.Ed, Diploma in Sports Coaching",
      bio: "Mr. Singh oversees all sports activities and physical education programs. He has trained many state-level athletes and promotes fitness and sportsmanship.",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: 3,
      name: "Mrs. Lakshmi Nair",
      position: "Librarian",
      email: "library@baliadangahs.edu",
      phone: "+91 9876543221",
      qualification: "M.Lib.I.Sc.",
      bio: "Mrs. Nair manages our extensive library and promotes reading through various initiatives. She helps students develop research skills and a love for literature.",
      image: "https://images.unsplash.com/photo-1563620915-8478239e9aab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    }
  ]
};

const StaffCard = ({ staff }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="h-64 overflow-hidden bg-gray-100">
        <img 
          src={staff.image} 
          alt={staff.name} 
          className="h-full w-full object-cover object-center"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl text-school-primary">{staff.name}</CardTitle>
        <p className="font-medium text-gray-600">{staff.position}</p>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm italic text-gray-500">{staff.qualification}</p>
        <p className="text-sm text-muted-foreground">{staff.bio}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={16} className="mr-2" />
          <a href={`mailto:${staff.email}`} className="hover:text-school-primary hover:underline">
            {staff.email}
          </a>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={16} className="mr-2" />
          <a href={`tel:${staff.phone}`} className="hover:text-school-primary hover:underline">
            {staff.phone}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filterStaff = (staffList) => {
    return staffList.filter(staff => 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredAdministration = filterStaff(staffMembers.administration);
  const filteredTeaching = filterStaff(staffMembers.teaching);
  const filteredSupport = filterStaff(staffMembers.support);
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Staff Directory</h1>
        <p className="text-lg text-muted-foreground">Meet our dedicated team of administrators, teachers, and support staff</p>
      </div>
      
      <div className="mb-8">
        <Input
          placeholder="Search staff by name or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          icon={Search}
        />
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4">
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="administration">Administration</TabsTrigger>
          <TabsTrigger value="teaching">Teaching Faculty</TabsTrigger>
          <TabsTrigger value="support">Support Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="space-y-12">
            <section>
              <h2 className="font-heading mb-6 text-2xl font-semibold text-school-primary">Administration</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAdministration.map(staff => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
              </div>
              {filteredAdministration.length === 0 && (
                <p className="py-4 text-center text-gray-500">No administration staff found matching your search.</p>
              )}
            </section>
            
            <section>
              <h2 className="font-heading mb-6 text-2xl font-semibold text-school-primary">Teaching Faculty</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeaching.map(staff => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
              </div>
              {filteredTeaching.length === 0 && (
                <p className="py-4 text-center text-gray-500">No teaching staff found matching your search.</p>
              )}
            </section>
            
            <section>
              <h2 className="font-heading mb-6 text-2xl font-semibold text-school-primary">Support Staff</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSupport.map(staff => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
              </div>
              {filteredSupport.length === 0 && (
                <p className="py-4 text-center text-gray-500">No support staff found matching your search.</p>
              )}
            </section>
          </div>
        </TabsContent>
        
        <TabsContent value="administration" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAdministration.map(staff => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
          {filteredAdministration.length === 0 && (
            <p className="py-4 text-center text-gray-500">No administration staff found matching your search.</p>
          )}
        </TabsContent>
        
        <TabsContent value="teaching" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeaching.map(staff => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
          {filteredTeaching.length === 0 && (
            <p className="py-4 text-center text-gray-500">No teaching staff found matching your search.</p>
          )}
        </TabsContent>
        
        <TabsContent value="support" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSupport.map(staff => (
              <StaffCard key={staff.id} staff={staff} />
            ))}
          </div>
          {filteredSupport.length === 0 && (
            <p className="py-4 text-center text-gray-500">No support staff found matching your search.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staff;
