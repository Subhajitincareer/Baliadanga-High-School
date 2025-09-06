import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Phone } from 'lucide-react';
import apiService from '@/services/api'; // <-- use your MERN service
import { StaffMember } from '@/hooks/use-staff';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type StaffByDepartment = {
  administration: StaffMember[];
  teaching: StaffMember[];
  support: StaffMember[];
};

const StaffCard = ({ staff }: { staff: StaffMember }) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
    <div className="h-64 overflow-hidden bg-gray-100">
      <img
        src={staff.image_url ||
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'}
        alt={staff.name}
        className="h-full w-full object-cover object-center"
      />
    </div>
    <CardHeader>
      <CardTitle className="text-xl text-school-primary">{staff.name}</CardTitle>
      <p className="font-medium text-gray-600">{staff.position}</p>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{staff.bio || 'No biography available.'}</p>
    </CardContent>
    <CardFooter className="flex flex-col items-start space-y-2">
      {staff.email && (
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={16} className="mr-2" />
          <a href={`mailto:${staff.email}`} className="hover:text-school-primary hover:underline">
            {staff.email}
          </a>
        </div>
      )}
      {staff.phone && (
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={16} className="mr-2" />
          <a href={`tel:${staff.phone}`} className="hover:text-school-primary hover:underline">
            {staff.phone}
          </a>
        </div>
      )}
    </CardFooter>
  </Card>
);

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffByDepartment>({
    administration: [],
    teaching: [],
    support: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);

        // Fetch staff from MERN REST API
        const data = await apiService.getStaff();

        if (data && data.length > 0) {
          const administration = data.filter((staff: StaffMember) =>
            staff.position?.toLowerCase().includes('principal') ||
            staff.position?.toLowerCase().includes('admin') ||
            staff.position?.toLowerCase().includes('director')
          );
          const teaching = data.filter((staff: StaffMember) =>
            staff.position?.toLowerCase().includes('teacher') ||
            staff.position?.toLowerCase().includes('professor') ||
            staff.position?.toLowerCase().includes('lecturer')
          );
          const support = data.filter((staff: StaffMember) =>
            !administration.includes(staff) && !teaching.includes(staff)
          );

          setStaffMembers({
            administration,
            teaching,
            support,
          });
        } else {
          // Fallback: show static staff sample if database is empty
          setStaffMembers(getStaticStaffMembers());
        }
      } catch (error) {
        console.error('Error fetching staff data:', error);
        setStaffMembers(getStaticStaffMembers());
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filterStaff = (staffList: StaffMember[]) =>
    staffList.filter(
      staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.position || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredAdministration = filterStaff(staffMembers.administration);
  const filteredTeaching = filterStaff(staffMembers.teaching);
  const filteredSupport = filterStaff(staffMembers.support);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <LoadingSpinner text="Loading staff directory..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Staff Directory</h1>
        <p className="text-lg text-muted-foreground">
          Meet our dedicated team of administrators, teachers, and support staff
        </p>
      </div>

      <div className="mb-8">
        <SearchInput
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

        <TabsContent value="all">
          <StaffSection title="Administration" staffList={filteredAdministration} />
          <StaffSection title="Teaching Faculty" staffList={filteredTeaching} />
          <StaffSection title="Support Staff" staffList={filteredSupport} />
        </TabsContent>
        <TabsContent value="administration">
          <StaffSection title="Administration" staffList={filteredAdministration} />
        </TabsContent>
        <TabsContent value="teaching">
          <StaffSection title="Teaching Faculty" staffList={filteredTeaching} />
        </TabsContent>
        <TabsContent value="support">
          <StaffSection title="Support Staff" staffList={filteredSupport} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper for rendering one department
const StaffSection = ({
  title,
  staffList,
}: {
  title: string;
  staffList: StaffMember[];
}) => (
  <section>
    <h2 className="font-heading mb-6 text-2xl font-semibold text-school-primary">
      {title}
    </h2>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {staffList.map((staff) => (
        <StaffCard key={staff.id} staff={staff} />
      ))}
    </div>
    {staffList.length === 0 && (
      <p className="py-4 text-center text-gray-500">
        No {title.toLowerCase()} staff found matching your search.
      </p>
    )}
  </section>
);

// Replace with your original or updated static fallback staff as needed
function getStaticStaffMembers(): StaffByDepartment {
  // ...static staff data...
  return { administration: [], teaching: [], support: [] };
}

export default Staff;
