export interface StudentResultsType {
    _id?: string;
    id?: string;
    studentName: string; // Changed from student_name to matcha typical camelCase if needed, but keeping original usage in mind
    student_name: string; // Keeping snake_case as per usage in StudentResults.tsx
    rollNumber: string;
    roll_number: string;
    className: string;
    class_name: string;
    subject: string;
    marks: number;
    totalMarks: number;
    total_marks: number;
    term: string;
    examDate: Date | string;
    exam_date: Date | string;
    // Add other loose types to prevent errors
    [key: string]: any;
}
