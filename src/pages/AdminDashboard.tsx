
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { Announcement } from '@/components/admin/AnnouncementForm';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { AnnouncementToolbar } from '@/components/admin/AnnouncementToolbar';
import { AnnouncementTable } from '@/components/admin/AnnouncementTable';

// Initial announcements data (we'll use localStorage to persist changes)
const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Annual Sports Day",
    date: "2025-04-15",
    type: "Event",
    description: "The annual sports day will be held on April 15th. All students are encouraged to participate in various sports activities. Parents are invited to attend and support their children."
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    date: "2025-04-20",
    type: "Notice",
    description: "Parent-teacher meeting for all classes will be held on April 20th from 10:00 AM to 2:00 PM. Parents are requested to attend without fail."
  },
  {
    id: 3,
    title: "Science Exhibition",
    date: "2025-05-05",
    type: "Event",
    description: "Science exhibition for classes 8-10 will be organized on May 5th. Students should submit their project proposals by April 25th."
  },
  {
    id: 4,
    title: "School Closed for Elections",
    date: "2025-04-10",
    type: "Notice",
    description: "The school will remain closed on April 10th due to municipal elections as the school premises will be used as a polling booth."
  }
];

const AdminDashboard = () => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | undefined>(undefined);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    // Load announcements from localStorage or use defaults
    const storedAnnouncements = localStorage.getItem('announcements');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    } else {
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveAnnouncement = (announcement: Omit<Announcement, 'id'> & { id?: number }) => {
    let updatedAnnouncements: Announcement[];
    
    if (announcement.id) {
      // Update existing announcement
      updatedAnnouncements = announcements.map(a => 
        a.id === announcement.id ? { ...announcement, id: a.id } as Announcement : a
      );
      toast({
        title: "Announcement Updated",
        description: "The announcement has been successfully updated.",
      });
    } else {
      // Create new announcement
      const newId = Math.max(0, ...announcements.map(a => a.id)) + 1;
      updatedAnnouncements = [
        ...announcements,
        { ...announcement, id: newId } as Announcement
      ];
      toast({
        title: "Announcement Created",
        description: "A new announcement has been successfully created.",
      });
    }
    
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    setIsCreating(false);
    setIsEditing(false);
    setCurrentAnnouncement(undefined);
  };

  const deleteAnnouncement = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      const updatedAnnouncements = announcements.filter(a => a.id !== id);
      setAnnouncements(updatedAnnouncements);
      localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been permanently removed.",
      });
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setIsEditing(true);
  };

  if (isCreating || isEditing) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">
            {isCreating ? "Create New Announcement" : "Edit Announcement"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isCreating ? "Add a new announcement to the school website" : "Modify an existing announcement"}
          </p>
        </div>
        
        <div className="mx-auto max-w-3xl">
          <AnnouncementForm
            announcement={currentAnnouncement}
            onSave={saveAnnouncement}
            onCancel={() => {
              setIsCreating(false);
              setIsEditing(false);
              setCurrentAnnouncement(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <DashboardHeader 
        title="Admin Dashboard"
        subtitle="Manage school announcements and notices"
        onLogout={handleLogout}
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Announcements Management</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementToolbar 
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onCreateClick={() => setIsCreating(true)}
          />

          <AnnouncementTable 
            announcements={filteredAnnouncements}
            onEdit={editAnnouncement}
            onDelete={deleteAnnouncement}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
