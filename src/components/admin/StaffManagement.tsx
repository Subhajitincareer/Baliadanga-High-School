
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchInput } from '@/components/ui/search-input';
import { useStaff, StaffMember } from '@/hooks/use-staff';
import { Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    bio: '',
    image_url: '',
  });
  
  const { staffMembers, isLoading, fetchStaffMembers, addStaffMember, updateStaffMember, deleteStaffMember } = useStaff();
  const isMobile = useIsMobile();

  const filteredStaff = staffMembers.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateClick = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      position: '',
      email: '',
      phone: '',
      bio: '',
      image_url: '',
    });
    setIsFormOpen(true);
  };

  const handleEditClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      position: staff.position,
      email: staff.email || '',
      phone: staff.phone || '',
      bio: staff.bio || '',
      image_url: staff.image_url || '',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (selectedStaff) {
      // Update existing staff member
      success = await updateStaffMember({
        id: selectedStaff.id,
        ...formData
      });
    } else {
      // Create new staff member
      success = await addStaffMember(formData);
    }
    
    if (success) {
      setIsFormOpen(false);
      fetchStaffMembers();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    
    const success = await deleteStaffMember(selectedStaff.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      fetchStaffMembers();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Staff Management</CardTitle>
        <CardDescription>
          Add, edit, or remove staff members
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search staff..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:max-w-xs"
            icon={Search}
          />
          
          <Button onClick={handleCreateClick} className="bg-school-primary hover:bg-school-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p>Loading staff data...</p>
          </div>
        ) : (
          <>
            {filteredStaff.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {!isMobile && <TableHead>Position</TableHead>}
                    {!isMobile && <TableHead>Email</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      {!isMobile && <TableCell>{staff.position}</TableCell>}
                      {!isMobile && <TableCell>{staff.email || '-'}</TableCell>}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(staff)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(staff)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <p>No staff members found{searchTerm ? ' matching your search criteria' : ''}.</p>
                {searchTerm && (
                  <Button variant="outline" className="mt-2" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Staff Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
            <DialogDescription>
              {selectedStaff 
                ? `Update ${selectedStaff.name}'s information` 
                : 'Enter details for the new staff member'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input 
                  id="position" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={handleFormChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedStaff ? 'Update' : 'Add'} Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedStaff?.name}'s profile from the staff directory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
