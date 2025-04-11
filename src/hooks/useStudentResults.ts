
import { useState, useEffect } from 'react';
import { supabase, StudentResults as StudentResultsType } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { NewResult } from '@/components/admin/results/AddResultForm';
import { ExamTerm } from '@/components/admin/results/ResultsTable';

interface UseStudentResultsReturn {
  results: StudentResultsType[];
  isLoading: boolean;
  fetchResults: () => Promise<void>;
  addResult: (newResult: NewResult) => Promise<boolean>;
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

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
      
      // Extract unique class names
      const uniqueClasses = Array.from(new Set(data?.map(result => result.class_name) || []));
      setClasses(uniqueClasses);
      
      // Set default selected class if available
      if (uniqueClasses.length > 0 && !selectedClass) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch student results',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const addResult = async (newResult: NewResult): Promise<boolean> => {
    try {
      if (!newResult.student_name || !newResult.roll_number || !newResult.class_name || 
          !newResult.subject || !newResult.marks || !newResult.total_marks) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return false;
      }

      const { error } = await supabase
        .from('student_results')
        .insert({
          student_name: newResult.student_name,
          roll_number: newResult.roll_number,
          class_name: newResult.class_name,
          subject: newResult.subject,
          marks: parseInt(newResult.marks),
          total_marks: parseInt(newResult.total_marks),
          term: newResult.term,
          exam_date: newResult.exam_date
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Result added successfully'
      });
      
      await fetchResults();
      return true;
    } catch (error) {
      console.error('Error adding result:', error);
      toast({
        title: 'Error',
        description: 'Failed to add result',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Filter results based on search term, selected term and class
  const filteredResults = results.filter(
    result =>
      (searchTerm === '' || 
        result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subject.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedTerm === 'Midterm' || result.term === selectedTerm) &&
      (selectedClass === '' || result.class_name === selectedClass)
  );

  // Group results by class for the selected term
  const resultsByClass = results.reduce((acc: Record<string, StudentResultsType[]>, result) => {
    if (selectedTerm === 'Midterm' || result.term === selectedTerm) {
      if (!acc[result.class_name]) {
        acc[result.class_name] = [];
      }
      acc[result.class_name].push(result);
    }
    return acc;
  }, {});

  // Data for the chart - class performance summary
  const classSummary = Object.entries(resultsByClass).reduce((acc: Record<string, { count: number; totalPercentage: number }>, [className, classResults]) => {
    const totalPercentage = classResults.reduce((sum, result) => sum + (result.marks / result.total_marks) * 100, 0);
    acc[className] = {
      count: classResults.length,
      totalPercentage: totalPercentage
    };
    return acc;
  }, {});

  return {
    results,
    isLoading,
    fetchResults,
    addResult,
    searchTerm,
    setSearchTerm,
    selectedTerm,
    setSelectedTerm,
    selectedClass,
    setSelectedClass,
    classes,
    filteredResults,
    resultsByClass,
    classSummary
  };
};

export default useStudentResults;
