import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase, Admissions } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EyeIcon, CheckCircle, XCircle, SearchIcon } from 'lucide-react';
import AdmissionDetail from '@/components/admission/AdmissionDetail';

type Admission = Admissions;

interface AdmissionStatusUpdateProps {
  admissionId: string;
  onClose: () => void;
  onUpdate: () => void;
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
  const { isAdmin, checkAdminStatus } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmissions(data as Admission[] || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admissions data.',
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
    setRollNumber('');
    setRemarks('');
  };

	const handleOpenRejectModal = (id: string) => {
    setSelectedAdmissionId(id);
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectRemarks('');
  };

  const handleApproveAdmission = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('admissions')
        .update({
          status: 'approved',
          roll_number: rollNumber,
          remarks: remarks
        })
        .eq('id', selectedAdmissionId);

      if (error) throw error;
      
      toast({
        title: 'Admission Approved',
        description: 'The admission has been successfully approved.',
      });
      
      setShowApproveModal(false);
      fetchAdmissions();
    } catch (error) {
      console.error('Error approving admission:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve admission.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAdmission = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('admissions')
        .update({
          status: 'rejected',
          remarks: rejectRemarks
        })
        .eq('id', selectedAdmissionId);

      if (error) throw error;
      
      toast({
        title: 'Admission Rejected',
        description: 'The admission has been rejected.',
      });
      
      setShowRejectModal(false);
      fetchAdmissions();
    } catch (error) {
      console.error('Error rejecting admission:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject admission.',
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
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAdmissions = admissions.filter(admission => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      admission.student_name.toLowerCase().includes(searchTermLower) ||
      admission.guardian_phone.toLowerCase().includes(searchTermLower) ||
      admission.access_code.toLowerCase().includes(searchTermLower)
    );
  });

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Unauthorized Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admission Management</h1>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search by name, phone, or access code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <SearchIcon className="h-5 w-5 text-gray-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredAdmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No admissions found.</TableCell>
                </TableRow>
              ) : (
                filteredAdmissions.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell>{admission.student_name}</TableCell>
                    <TableCell>{formatDate(admission.created_at)}</TableCell>
                    <TableCell>Class {admission.class_applying_for}</TableCell>
                    <TableCell>{admission.guardian_phone}</TableCell>
                    <TableCell>
                      {admission.status === 'approved' ? (
                        <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>
                      ) : admission.status === 'rejected' ? (
                        <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(admission.id)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {admission.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenApproveModal(admission.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Approve
                          </Button>
													<Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenRejectModal(admission.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Admission</DialogTitle>
            <DialogDescription>
              Enter the roll number and any remarks for this student.
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
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="remarks" className="text-right">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseApproveModal}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApproveAdmission} disabled={isProcessing}>
              {isProcessing ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

			<Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Admission</DialogTitle>
            <DialogDescription>
              Enter the remarks for rejecting this student admission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rejectRemarks" className="text-right">
                Remarks
              </Label>
              <Textarea
                id="rejectRemarks"
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseRejectModal}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRejectAdmission} disabled={isProcessing}>
              {isProcessing ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
