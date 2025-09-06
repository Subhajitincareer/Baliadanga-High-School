import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { examTerms, ExamTerm } from './ResultsTable';

// Define the structure for a new result entry (snake_case, backend compatible)
export interface NewResult {
  student_name: string;
  roll_number: string;
  class_name: string;
  subject: string;
  marks: string;
  total_marks: string;
  term: ExamTerm;
  exam_date: string;
}

interface AddResultFormProps {
  onSubmit: (values: NewResult) => Promise<void>;
  onCancel: () => void;
}

const AddResultForm: React.FC<AddResultFormProps> = ({ onSubmit, onCancel }) => {
  const [newResult, setNewResult] = useState<NewResult>({
    student_name: '',
    roll_number: '',
    class_name: '',
    subject: '',
    marks: '',
    total_marks: '100',
    term: 'Midterm',
    exam_date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResult(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewResult(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newResult);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Result</CardTitle>
        <CardDescription>Enter the student's result information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="student_name" className="text-sm font-medium">Student Name</label>
            <Input
              id="student_name"
              name="student_name"
              value={newResult.student_name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="roll_number" className="text-sm font-medium">Roll Number</label>
            <Input
              id="roll_number"
              name="roll_number"
              value={newResult.roll_number}
              onChange={handleInputChange}
              placeholder="R-12345"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="class_name" className="text-sm font-medium">Class</label>
            <Input
              id="class_name"
              name="class_name"
              value={newResult.class_name}
              onChange={handleInputChange}
              placeholder="Grade 10"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject</label>
            <Input
              id="subject"
              name="subject"
              value={newResult.subject}
              onChange={handleInputChange}
              placeholder="Mathematics"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="marks" className="text-sm font-medium">Marks Obtained</label>
            <Input
              id="marks"
              name="marks"
              type="number"
              min="0"
              max={newResult.total_marks}
              value={newResult.marks}
              onChange={handleInputChange}
              placeholder="85"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="total_marks" className="text-sm font-medium">Total Marks</label>
            <Input
              id="total_marks"
              name="total_marks"
              type="number"
              min="1"
              value={newResult.total_marks}
              onChange={handleInputChange}
              placeholder="100"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="term" className="text-sm font-medium">Term</label>
            <Select
              value={newResult.term}
              onValueChange={value => handleSelectChange('term', value)}
            >
              <SelectTrigger id="term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {examTerms.map(term => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="exam_date" className="text-sm font-medium">Exam Date</label>
            <Input
              id="exam_date"
              name="exam_date"
              type="date"
              value={newResult.exam_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Result</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddResultForm;
