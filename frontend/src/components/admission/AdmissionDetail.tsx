import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import apiService from '@/services/api';

interface AdmissionDetailProps {
  admissionId: string;
  isOpen: boolean;
  onClose: () => void;
}

type AdmissionFullDetails = {
  _id: string;
  access_code: string;
  status: string;
  created_at: string;
  student_name: string;
  gender: string;
  date_of_birth: string;
  class_applying_for: string;
  father_name?: string;
  mother_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  address?: string;
  previous_school?: string;
  previous_class?: string;
  previous_marks?: string;
  documents_url?: string[]; // array of document URLs
  roll_number?: string;
  remarks?: string;
};

const AdmissionDetail: React.FC<AdmissionDetailProps> = ({
  admissionId,
  isOpen,
  onClose,
}) => {
  const [admission, setAdmission] = useState<AdmissionFullDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdmissionDetails = useCallback(async () => {
    try {
      const data = await apiService.getAdmissionById(admissionId);
      setAdmission(data);
    } catch (error: any) {
      console.error('Error fetching admission details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load admission details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [admissionId, toast]);

  useEffect(() => {
    if (isOpen && admissionId) {
      setIsLoading(true);
      fetchAdmissionDetails();
    }
  }, [isOpen, admissionId, fetchAdmissionDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Admission Application Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Loading application details..." />
          </div>
        ) : admission ? (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Access Code</p>
                <p className="font-mono text-base">{admission.access_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${admission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    admission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                  {admission.status === 'approved' ? 'Approved' :
                    admission.status === 'rejected' ? 'Rejected' :
                      'Pending'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applied On</p>
                <p>{formatDate(admission.created_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{admission.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p>{admission.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p>{admission.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class Applying For</p>
                  <p>Class {admission.class_applying_for}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Father's Name</p>
                  <p>{admission.father_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mother's Name</p>
                  <p>{admission.mother_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p>{admission.guardian_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p>{admission.guardian_email || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{admission.address}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Previous Education</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Previous School</p>
                  <p>{admission.previous_school}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Previous Class</p>
                  <p>Class {admission.previous_class}</p>
                </div>
                {admission.previous_marks && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Previous Marks</p>
                    <p>{admission.previous_marks}%</p>
                  </div>
                )}
              </div>
            </div>

            {admission.documents_url && admission.documents_url.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {admission.documents_url.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border rounded-md hover:bg-secondary"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">Document {index + 1}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {admission.status !== 'pending' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Decision</h3>
                <div className="grid grid-cols-2 gap-4">
                  {admission.roll_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                      <p className="font-mono">{admission.roll_number}</p>
                    </div>
                  )}
                  {admission.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                      <p>{admission.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p>No admission details found.</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdmissionDetail;
