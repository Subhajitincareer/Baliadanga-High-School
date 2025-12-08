import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, GraduationCap, Building2 } from 'lucide-react';
import apiService, { Staff } from '@/services/api';

const Staff = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await apiService.getPublicStaffDirectory();
        setStaffList(data);
      } catch (error) {
        console.error('Failed to fetch staff directory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'vice principal': return 'bg-purple-50 text-purple-700';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-12 bg-gray-50/50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-school-primary mb-4">Our Dedicated Faculty & Staff</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Meet the experienced educators and professionals committed to nurturing the future of our students.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-64 bg-gray-200" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffList.map((staff) => (
            <Card key={staff._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none ring-1 ring-gray-100">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative group">
                {/* Placeholder for Staff Image - In future, bind to staff.profileImage */}
                <span className="text-6xl font-bold text-slate-300 select-none">
                  {staff.fullName.charAt(0)}
                </span>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <CardContent className="p-6 text-center">
                <Badge variant="secondary" className={`mb-3 ${getRoleColor(staff.position)}`}>
                  {staff.position}
                </Badge>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{staff.fullName}</h3>

                {staff.department && (
                  <p className="text-sm text-gray-600 mb-4 flex items-center justify-center gap-1">
                    <Building2 className="w-3 h-3" /> {staff.department}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-100 w-full flex justify-center">
                  <a href={`mailto:${staff.email}`} className="text-sm text-school-primary hover:text-school-dark flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4" /> {staff.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && staffList.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>No staff members found in the directory.</p>
        </div>
      )}
    </div>
  );
};

export default Staff;
