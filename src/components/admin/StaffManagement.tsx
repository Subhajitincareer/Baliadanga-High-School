import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { useStaff, StaffMember } from '@/hooks/use-staff';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { StaffCardMobile } from './StaffCardMobile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function StaffManagement() {
  const { staffMembers, isLoading, fetchStaffMembers, addStaffMember, updateStaffMember, deleteStaffMember } = useStaff();
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    name: '',
    position: '',
    email: '',
    phone: '',
    bio: '',
    image_url: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const isMobile = useIsMobile();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (staff: StaffMember) => {
    setStaffForm(staff);
    setEditingId(staff.id);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffForm.name || !staffForm.position) {
      return;
    }

    let success;
    if (editingId) {
      success = await updateStaffMember({ ...staffForm, id: editingId } as StaffMember);
    } else {
      success = await addStaffMember(staffForm as Omit<StaffMember, 'id'>);
    }

    if (success) {
      setStaffForm({
        name: '',
        position: '',
        email: '',
        phone: '',
        bio: '',
        image_url: '',
      });
      setEditingId(null);
      setIsFormOpen(false);
      fetchStaffMembers();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    const success = await deleteStaffMember(staffToDelete.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      fetchStaffMembers();
    }
  };

  const renderForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={staffForm.name || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position *</Label>
        <Input
          id="position"
          name="position"
          value={staffForm.position || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={staffForm.email || ''}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={staffForm.phone || ''}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Biography</Label>
        <Textarea
          id="bio"
          name="bio"
          value={staffForm.bio || ''}
          onChange={handleInputChange}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={staffForm.image_url || ''}
          onChange={handleInputChange}
        />
      </div>
      <DialogFooter className="mt-6">
        <Button type="submit">
          {editingId ? 'Update Staff Member' : 'Add Staff Member'}
        </Button>
      </DialogFooter>
    </form>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Staff Directory</h2>
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="sm" className="flex-shrink-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4">
                {renderForm()}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Loading staff directory..." />
          </div>
        ) : (
          <div className="space-y-4">
            {staffMembers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No staff members found. Add your first one by clicking the button above.
              </p>
            ) : (
              staffMembers.map((staff) => (
                <StaffCardMobile 
                  key={staff.id}
                  staff={staff}
                  onEdit={() => handleEditClick(staff)}
                  onDelete={() => handleDeleteClick(staff)}
                />
              ))
            )}
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {staffToDelete?.name}'s profile from the staff directory.
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Staff Directory</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading staff directory..." />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No staff members found. Add your first one by clicking the "Add Staff Member" button.
                  </TableCell>
                </TableRow>
              ) : (
                staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>
                      {staff.email && <div>{staff.email}</div>}
                      {staff.phone && <div>{staff.phone}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(staff)}
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
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {staffToDelete?.name}'s profile from the staff directory.
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
    </div>
  );
}
