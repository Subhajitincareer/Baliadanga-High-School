import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Search, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import apiService, { Staff } from '@/services/api'; // Ensure Staff interface is exported
import { StaffDialog } from './StaffDialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await apiService.getStaff();
      // Ensure data is an array
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff list.',
        variant: 'destructive',
      });
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setStaffToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      await apiService.deleteStaff(staffToDelete);
      toast({
        title: 'Staff Deleted',
        description: 'Staff member has been removed successfully.',
      });
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  // Filter staff based on search term
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Manage teachers, administrators, and support staff.</CardDescription>
          </div>
          <Button onClick={handleAddStaff} className="bg-school-primary hover:bg-school-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading staff data...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center opacity-70">
                      {staffList.length === 0 ? "No staff members found. Add one to get started." : "No matching records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff._id || staff.employeeId}>
                      <TableCell className="font-medium">{staff.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {staff.fullName}
                        </div>
                      </TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStaff(staff)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => staff._id && handleDeleteClick(staff._id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StaffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedStaff={selectedStaff}
        onSuccess={fetchStaff}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff profile and removing their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


