
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StaffMember = {
  id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
  bio?: string;
  image_url?: string;
};

export function useStaff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaffMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("staff")
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setStaffMembers(data);
      }
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

  const addStaffMember = async (staffMember: Omit<StaffMember, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([staffMember])
        .select();

      if (error) throw error;

      if (data) {
        toast({
          title: 'Staff member added',
          description: `${staffMember.name} has been added successfully.`,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateStaffMember = async (staffMember: StaffMember) => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .update(staffMember)
        .eq("id", staffMember.id)
        .select();

      if (error) throw error;

      if (data) {
        toast({
          title: 'Staff member updated',
          description: `${staffMember.name}'s information has been updated.`,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update staff member.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteStaffMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: 'Staff member deleted',
        description: 'The staff member has been removed successfully.',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member.',
        variant: 'destructive',
      });
      return false;
    }
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
    deleteStaffMember
  };
}
