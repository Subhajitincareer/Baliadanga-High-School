import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Updated interface to match MongoDB schema
export type StaffMember = {
  _id?: string;
  employeeId: string;
  fullName: string;
  email: string;
  position: 'Teacher' | 'Admin' | 'Principal' | 'Vice Principal' | 'Coordinator';
  department: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  joiningDate?: string;
  salary?: number;
  subjects?: string[];
  classes?: string[];
  isActive?: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useStaff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaffMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getStaff();
      setStaffMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStaffMember = async (staffMember: Omit<StaffMember, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newStaff = await apiService.createStaff(staffMember);
      
      toast({
        title: 'Staff member added',
        description: `${staffMember.fullName} has been added successfully.`,
      });
      
      // Refresh the staff list
      await fetchStaffMembers();
      return newStaff;
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateStaffMember = async (staffMember: StaffMember) => {
    try {
      if (!staffMember._id) {
        throw new Error('Staff member ID is required for update');
      }

      const updatedStaff = await apiService.updateStaff(staffMember._id, staffMember);
      
      toast({
        title: 'Staff member updated',
        description: `${staffMember.fullName}'s information has been updated.`,
      });
      
      // Refresh the staff list
      await fetchStaffMembers();
      return updatedStaff;
    } catch (error: any) {
      console.error('Error updating staff member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update staff member.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteStaffMember = async (id: string) => {
    try {
      await apiService.deleteStaff(id);
      
      toast({
        title: 'Staff member deleted',
        description: 'The staff member has been removed successfully.',
      });
      
      // Refresh the staff list
      await fetchStaffMembers();
      return true;
    } catch (error: any) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete staff member.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getStaffByDepartment = (department: string) => {
    return staffMembers.filter(staff => 
      staff.department.toLowerCase() === department.toLowerCase()
    );
  };

  const getStaffByPosition = (position: string) => {
    return staffMembers.filter(staff => 
      staff.position.toLowerCase() === position.toLowerCase()
    );
  };

  const getActiveStaff = () => {
    return staffMembers.filter(staff => staff.isActive !== false);
  };

  const searchStaff = (query: string) => {
    const searchTerm = query.toLowerCase();
    return staffMembers.filter(staff => 
      staff.fullName.toLowerCase().includes(searchTerm) ||
      staff.email.toLowerCase().includes(searchTerm) ||
      staff.employeeId.toLowerCase().includes(searchTerm) ||
      staff.department.toLowerCase().includes(searchTerm)
    );
  };

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  return {
    staffMembers,
    isLoading,
    fetchStaffMembers,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    getStaffByDepartment,
    getStaffByPosition,
    getActiveStaff,
    searchStaff
  };
}
