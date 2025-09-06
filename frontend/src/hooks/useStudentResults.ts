import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { NewResult } from '@/components/admin/results/AddResultForm';
import { ExamTerm } from '@/components/admin/results/ResultsTable';

// Update to match your backend's result model
export interface StudentResultsType {
  _id: string;
  studentName: string;
  rollNumber: string;
  class: string;
  subject: string;
  marks: number;
  totalMarks: number;
  term: ExamTerm;
  examDate: string;
  createdAt?: string;
}

interface UseStudentResultsReturn {
  results: StudentResultsType[];
  isLoading: boolean;
  fetchResults: () => Promise<void>;
  addResult: (newResult: NewResult) => Promise<boolean>;
  deleteResult: (id: string) => Promise<boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTerm: ExamTerm;
  setSelectedTerm: (term: ExamTerm) => void;
  selectedClass: string;
  setSelectedClass: (className: string) => void;
  classes: string[];
  filteredResults: StudentResultsType[];
  resultsByClass: Record<string, StudentResultsType[]>;
  classSummary: Record<string, { count: number; totalPercentage: number }>;
}

const useStudentResults = (): UseStudentResultsReturn => {
  const [results, setResults] = useState<StudentResultsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('Midterm');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getStudentResults('all'); // Or pass studentId/classId as needed
      setResults(data || []);

      // Extract unique class names
      const uniqueClasses = Array.from(new Set((data || []).map(result => result.class)));
      setClasses(uniqueClasses);

      // Set default selected class if available
      if (uniqueClasses.length > 0 && !selectedClass) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch student results',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, toast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const addResult = async (newResult: NewResult): Promise<boolean> => {
    try {
      if (
        !newResult.studentName ||
        !newResult.rollNumber ||
        !newResult.class ||
        !newResult.subject ||
        !newResult.marks ||
        !newResult.totalMarks
      ) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return false;
      }

      await apiService.createStudentResult({
        studentName: newResult.studentName,
        rollNumber: newResult.rollNumber,
        class: newResult.class,
        subject: newResult.subject,
        marks: parseInt(newResult.marks),
        totalMarks: parseInt(newResult.totalMarks),
        term: newResult.term,
        examDate: newResult.examDate,
      });

      toast({
        title: 'Success',
        description: 'Result added successfully',
      });

      await fetchResults();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add result',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteResult = async (id: string): Promise<boolean> => {
    try {
      await apiService.deleteStudentResult(id);

      toast({
        title: 'Success',
        description: 'Result deleted successfully',
      });

      setResults(results.filter(result => result._id !== id));
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete result',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Filtering for search/term/class
  const filteredResults = results.filter(
    result =>
      (searchTerm === '' ||
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTerm === 'Midterm' || result.term === selectedTerm) &&
      (selectedClass === 'all' || result.class === selectedClass)
  );

  // Grouped by class and class performance summary
  const resultsByClass = results.reduce((acc: Record<string, StudentResultsType[]>, result) => {
    if (selectedTerm === 'Midterm' || result.term === selectedTerm) {
      if (!acc[result.class]) acc[result.class] = [];
      acc[result.class].push(result);
    }
    return acc;
  }, {});

  const classSummary = Object.entries(resultsByClass).reduce(
    (acc: Record<string, { count: number; totalPercentage: number }>, [className, classResults]) => {
      const totalPercentage = classResults.reduce((sum, result) => sum + (result.marks / result.totalMarks) * 100, 0);
      acc[className] = {
        count: classResults.length,
        totalPercentage: totalPercentage,
      };
      return acc;
    },
    {}
  );

  return {
    results,
    isLoading,
    fetchResults,
    addResult,
    deleteResult,
    searchTerm,
    setSearchTerm,
    selectedTerm,
    setSelectedTerm,
    selectedClass,
    setSelectedClass,
    classes,
    filteredResults,
    resultsByClass,
    classSummary,
  };
};

export default useStudentResults;
