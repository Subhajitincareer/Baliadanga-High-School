import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EyeIcon, CheckCircle, XCircle, SearchIcon } from 'lucide-react';
import AdmissionDetail from '@/components/admission/AdmissionDetail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Updated interface to match MongoDB schema
interface Admission {
  _id: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  guardianName: string;
  guardianPhone: string;
  previousSchool?: string;
  class: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rollNumber?: string;
  remarks?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAccess = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || !isAuthenticated) {
        navigate('/admin');
        return;
      }

      if (userRole !== 'admin') {
        navigate('/unauthorized');
        return;
      }

      fetchAdmissions();
    };

    verifyAccess();
  }, [isAuthenticated, navigate]);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdmissions();
      setAdmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching admissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load admissions data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenApproveModal = (id: string) => {
    setSelectedAdmissionId(id);
    setShowApproveModal(true);
  };

  const handleCloseApproveModal = () => {
    setShowApproveModal(false);
    setSelectedAdmissionId(null);
    setRollNumber('');
    setRemarks('');
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedAdmissionId(id);
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAdmissionId(null);
    setRejectRemarks('');
  };

  const handleApproveAdmission = async () => {
    if (!selectedAdmissionId) return;
    
    setIsProcessing(true);
    try {
      await apiService.updateAdmissionStatus(selectedAdmissionId, 'Approved');
      
      // If roll number and remarks are provided, update them too
      if (rollNumber || remarks) {
        const admission = admissions.find(a => a._id === selectedAdmissionId);
        if (admission) {
          await apiService.updateAdmission(selectedAdmissionId, {
            ...admission,
            rollNumber,
            remarks,
            status: 'Approved'
          });
        }
      }
      
      toast({
        title: 'Admission Approved',
        description: 'The admission has been successfully approved.',
      });
      
      handleCloseApproveModal();
      await fetchAdmissions();
    } catch (error: any) {
      console.error('Error approving admission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve admission.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAdmission = async () => {
    if (!selectedAdmissionId) return;
    
    setIsProcessing(true);
    try {
      await apiService.updateAdmissionStatus(selectedAdmissionId, 'Rejected');
      
      // If reject remarks are provided, update them
      if (rejectRemarks) {
        const admission = admissions.find(a => a._id === selectedAdmissionId);
        if (admission) {
          await apiService.updateAdmission(selectedAdmissionId, {
            ...admission,
            remarks: rejectRemarks,
            status: 'Rejected'
          });
        }
      }
      
      toast({
        title: 'Admission Rejected',
        description: 'The admission has been rejected.',
      });
      
      handleCloseRejectModal();
      await fetchAdmissions();
    } catch (error: any) {
      console.error('Error rejecting admission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject admission.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedAdmissionId(id);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedAdmissionId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'Pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      admission.studentName.toLowerCase().includes(searchTermLower) ||
      admission.guardianPhone.toLowerCase().includes(searchTermLower) ||
      admission.email.toLowerCase().includes(searchTermLower) ||
      admission.class.toLowerCase().includes(searchTermLower)
    );
  });

  const pendingCount = admissions.filter(a => a.status === 'Pending').length;
  const approvedCount = admissions.filter(a => a.status === 'Approved').length;
  const rejectedCount = admissions.filter(a => a.status === 'Rejected').length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admission Management</h1>
        <p className="text-muted-foreground">Manage student admission applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, phone, email, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text="Loading admissions..." />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAdmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? 'No admissions found matching your search.' : 'No admissions found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmissions.map((admission) => (
                  <TableRow key={admission._id}>
                    <TableCell className="font-medium">{admission.studentName}</TableCell>
                    <TableCell>{formatDate(admission.createdAt)}</TableCell>
                    <TableCell>Class {admission.class}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{admission.phoneNumber}</div>
                        <div className="text-sm text-muted-foreground">{admission.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{admission.guardianName}</div>
                        <div className="text-sm text-muted-foreground">{admission.guardianPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(admission.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(admission._id)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {admission.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenApproveModal(admission._id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenRejectModal(admission._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
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
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Admission</DialogTitle>
            <DialogDescription>
              Enter the roll number and any remarks for this student admission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollNumber" className="text-right">
                Roll Number
              </Label>
              <Input
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 2025001"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="remarks" className="text-right pt-2">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="col-span-3"
                placeholder="Optional remarks..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseApproveModal}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleApproveAdmission} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Approving...' : 'Approve Admission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Admission</DialogTitle>
            <DialogDescription>
              Enter the reason for rejecting this student admission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rejectRemarks" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="rejectRemarks"
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="col-span-3"
                placeholder="Enter reason for rejection..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseRejectModal}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleRejectAdmission} 
              disabled={isProcessing || !rejectRemarks.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Rejecting...' : 'Reject Admission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admission Detail Dialog */}
      {selectedAdmissionId && (
        <AdmissionDetail
          admissionId={selectedAdmissionId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default AdmissionManagement;
