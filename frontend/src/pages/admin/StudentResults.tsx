import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { Button } from '@/components/ui/button';
import useStudentResults from '@/hooks/useStudentResults';
import ResultsTable from '@/components/admin/results/ResultsTable';
import PerformanceChart from '@/components/admin/results/PerformanceChart';
import ResultsFilter from '@/components/admin/results/ResultsFilter';
import AddResultForm, { NewResult } from '@/components/admin/results/AddResultForm';
import StatsSummary from '@/components/admin/results/StatsSummary';
import { DeleteResultDialog } from '@/components/admin/results/DeleteResultDialog';
// Import your backend StudentResultsType if needed
import { StudentResultsType } from '@/schemas/studentResult';

interface StudentResultsProps {
  hideHeader?: boolean;
}

const StudentResults: React.FC<StudentResultsProps> = ({ hideHeader = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StudentResultsType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();

  const {
    results,
    isLoading,
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
    classSummary
  } = useStudentResults();

  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleAddResult = async (newResult: NewResult) => {
    const success = await addResult(newResult);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleDeleteClick = (result: StudentResultsType) => {
    setSelectedResult(result);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedResult) {
      // Use _id for delete in MERN (adjust if your id field is named differently)
      await deleteResult(selectedResult._id || selectedResult.id);
      setShowDeleteDialog(false);
      setSelectedResult(null);
    }
  };

  const downloadCSV = () => {
    const filteredForExport = results.filter(result =>
      (selectedTerm === 'Midterm' || result.term === selectedTerm) &&
      (selectedClass === 'all' || result.class_name === selectedClass)
    );

    const headers = ['Student Name', 'Roll Number', 'Class', 'Subject', 'Marks', 'Total Marks', 'Term', 'Exam Date'];
    const dataRows = filteredForExport.map(result => [
      result.student_name,
      result.roll_number,
      result.class_name,
      result.subject,
      result.marks,
      result.total_marks,
      result.term,
      new Date(result.exam_date).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student_results_${selectedTerm}_${selectedClass}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-8">
      {!hideHeader && (
        <DashboardHeader
          title="Student Results Management"
          subtitle="View and manage student examination results"
          onLogout={handleLogout}
        />
      )}

      {!hideHeader && (
        <div className="my-6">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
        </div>
      )}

      <StatsSummary
        results={results}
        filteredResults={filteredResults}
        classSummary={classSummary}
      />

      <PerformanceChart
        results={results}
        selectedTerm={selectedTerm}
      />

      <ResultsFilter
        searchTerm={searchTerm}
        selectedClass={selectedClass}
        classes={classes}
        onSearchChange={handleSearchChange}
        onClassChange={setSelectedClass}
        onAddClick={() => setShowAddForm(!showAddForm)}
        onDownloadClick={downloadCSV}
      />

      {showAddForm && (
        <AddResultForm
          onSubmit={handleAddResult}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <ResultsTable
        results={filteredResults}
        selectedTerm={selectedTerm}
        setSelectedTerm={setSelectedTerm}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
      />

      <DeleteResultDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedResult={selectedResult}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default StudentResults;
