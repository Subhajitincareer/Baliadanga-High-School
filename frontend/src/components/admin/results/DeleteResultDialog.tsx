import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Updated interface to match MongoDB schema
interface StudentResult {
  _id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  examType: 'Unit Test' | 'Mid Term' | 'Final Exam' | 'Annual' | 'Monthly Test';
  academicYear: string;
  subjects: Array<{
    subjectName: string;
    subjectCode: string;
    fullMarks: number;
    obtainedMarks: number;
    grade?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    remarks?: string;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  rank?: number;
  publishDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResult: StudentResult | null;
  onConfirm: () => void;
}

export function DeleteResultDialog({ 
  isOpen, 
  onOpenChange, 
  selectedResult, 
  onConfirm 
}: DeleteResultDialogProps) {
  // Get subject names for display
  const subjectNames = selectedResult?.subjects
    ?.map(subject => subject.subjectName)
    .join(', ') || 'All subjects';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the result for <strong>{selectedResult?.studentName}</strong>
            {' '}(Roll No: {selectedResult?.rollNumber}) in <strong>{selectedResult?.class}-{selectedResult?.section}</strong>
            {' '}for <strong>{selectedResult?.examType}</strong> ({selectedResult?.academicYear}).
            <br /><br />
            <span className="text-sm text-muted-foreground">
              Subjects: {subjectNames}
            </span>
            <br /><br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
