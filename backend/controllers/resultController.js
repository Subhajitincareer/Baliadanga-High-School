import Result from '../models/Result.js';
import Exam from '../models/Exam.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// Helper to calculate Grade
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

// @desc    Enter/Update Marks for a Student
// @route   POST /api/results/marks
// @access  Private (Admin/Teacher)
export const updateMarks = asyncHandler(async (req, res) => {
    const { studentId, examId, marks } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    // Calculate Total & Percentage
    let totalObtained = 0;
    let totalFullMarks = 0;

    // Validate subjects and sum up
    exam.subjects.forEach(subject => {
        const subjectMarks = marks[subject.name] || 0;
        totalObtained += Number(subjectMarks);
        totalFullMarks += subject.fullMarks;
    });

    const percentage = totalFullMarks > 0 ? (totalObtained / totalFullMarks) * 100 : 0;
    const grade = calculateGrade(percentage);

    // Upsert Result
    let result = await Result.findOne({ studentId, examId });

    if (result) {
        result.marks = marks;
        result.totalObtained = totalObtained;
        result.percentage = percentage;
        result.grade = grade;
        await result.save();
    } else {
        result = await Result.create({
            studentId,
            examId,
            marks,
            totalObtained,
            percentage,
            grade
        });
    }

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get Results for an Exam (Admin/Teacher Class View)
// @route   GET /api/results/exam/:examId
// @access  Private (Admin/Teacher)
export const getExamResults = asyncHandler(async (req, res) => {
    const results = await Result.find({ examId: req.params.examId })
        .populate('studentId', 'name email rollNumber') // Assuming Student has name/roll
        .sort({ rank: 1 });

    res.json({
        success: true,
        count: results.length,
        data: results
    });
});

// @desc    Publish Results & Calculate Ranks
// @route   POST /api/results/publish/:examId
// @access  Private (Admin)
export const publishResults = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    // 1. Get all results for this exam sorted by Total Marks (Desc)
    const results = await Result.find({ examId }).sort({ totalObtained: -1 });

    // 2. Assign Rank
    for (let i = 0; i < results.length; i++) {
        results[i].rank = i + 1;
        await results[i].save();
    }

    // 3. Mark Exam as Published
    exam.isPublished = true;
    await exam.save();

    res.json({
        success: true,
        message: `Results published for ${exam.name}. Ranks generated for ${results.length} students.`
    });
});

// @desc    Get My Result (Student)
// @route   GET /api/results/my
// @access  Private (Student)
export const getMyResults = asyncHandler(async (req, res) => {
    // Find results for logged-in student
    // Note: req.user.id is the User ID. If Result uses Student ID, we need to map via Student profile first.
    // For now, assuming we link via User ID or similar. 
    // Ideally: const student = await Student.findOne({ userId: req.user.id });

    // Simplification: We will implement getStudentByUserId helper in future. 
    // Let's assume the frontend passes the Student ID or we find it.

    // TEMPORARY: Just find all results where studentId matches (assuming we passed it or handle mapping)
    // A better approach is to rely on req.user.id -> Student -> Result

    res.status(501).json({ message: "Student mapping logic required first" });
});
