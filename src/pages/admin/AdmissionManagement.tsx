
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Check, X, Eye } from 'lucide-react';
import AdmissionDetail from '@/components/admission/AdmissionDetail';

interface Admission {
  id: string;
  student_name: string;
  class_applying_for: string;
  status: string;
  created_at: string;
  access_code: string;
  roll_number: string | null;
}

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    
    fetchAdmissions();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterAdmissions();
  }, [searchTerm, statusFilter, admissions]);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      // Using type assertion to handle the dynamic table access
      const { data, error } = await (supabase
        .from('admissions') as any)
        .select('id, student_name, class_applying_for, status, created_at, access_code, roll_number')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmissions(data || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admission applications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAdmissions = () => {
    let filtered = [...admissions];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(admission => admission.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        admission =>
          admission.student_name.toLowerCase().includes(lowercaseSearchTerm) ||
          admission.access_code.toLowerCase().includes(lowercaseSearchTerm)
      );
    }

    setFilteredAdmissions(filtered);
  };

  const handleViewAdmission = (admission: Admission) => {
    setSelectedAdmission(admission);
    setIsViewOpen(true);
  };

  const handleApproveOpen = (admission: Admission) => {
    setSelectedAdmission(admission);
    setRollNumber('');
    setRemarks('');
    setIsApproveDialogOpen(true);
  };

  const handleRejectOpen = (admission: Admission) => {
    setSelectedAdmission(admission);
    setRemarks('');
    setIsRejectDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedAdmission) return;
    
    try {
      // Using type assertion for the dynamic table access
      const { error } = await (supabase
        .from('admissions') as any)
        .update({
          status: 'approved',
          roll_number: rollNumber,
          remarks: remarks
        })
        .eq('id', selectedAdmission.id);

      if (error) throw error;
      
      toast({
        title: 'Application Approved',
        description: `${selectedAdmission.student_name}'s application has been approved.`,
      });
      
      // Update local state
      setAdmissions(prev =>
        prev.map(item =>
          item.id === selectedAdmission.id
            ? { ...item, status: 'approved', roll_number: rollNumber }
            : item
        )
      );
      
      setIsApproveDialogOpen(false);
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the application.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedAdmission) return;
    
    try {
      // Using type assertion for the dynamic table access
      const { error } = await (supabase
        .from('admissions') as any)
        .update({
          status: 'rejected',
          remarks: remarks
        })
        .eq('id', selectedAdmission.id);

      if (error) throw error;
      
      toast({
        title: 'Application Rejected',
        description: `${selectedAdmission.student_name}'s application has been rejected.`,
      });
      
      // Update local state
      setAdmissions(prev =>
        prev.map(item =>
          item.id === selectedAdmission.id
            ? { ...item, status: 'rejected' }
            : item
        )
      );
      
      setIsRejectDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the application.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-8">
      <DashboardHeader 
        title="Admission Management" 
        subtitle="Review and process admission applications" 
        onLogout={logout}
      />

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 my-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or access code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchAdmissions}>
          Refresh
        </Button>
      </div>

      {/* Admissions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Access Code</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : filteredAdmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmissions.map((admission) => (
                <TableRow key={admission.id}>
                  <TableCell>{admission.student_name}</TableCell>
                  <TableCell>Class {admission.class_applying_for}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      {admission.access_code}
                    </code>
                  </TableCell>
                  <TableCell>{admission.roll_number || '-'}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${admission.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        admission.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`
                    }>
                      {admission.status === 'approved' ? 'Approved' : 
                       admission.status === 'rejected' ? 'Rejected' : 
                       'Pending'}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(admission.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAdmission(admission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {admission.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveOpen(admission)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectOpen(admission)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Admission Details Dialog */}
      {selectedAdmission && (
        <AdmissionDetail
          admissionId={selectedAdmission.id}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="roll-number" className="text-sm font-medium">
                Assign Roll Number
              </label>
              <Input
                id="roll-number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter roll number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="remarks" className="text-sm font-medium">
                Remarks (Optional)
              </label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproveSubmit} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reject-remarks" className="text-sm font-medium">
                Reason for Rejection
              </label>
              <Textarea
                id="reject-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Provide reason for rejection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectSubmit} 
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdmissionManagement;
