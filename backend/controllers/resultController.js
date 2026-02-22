import Result from '../models/Result.js';
import Exam from '../models/Exam.js';
import StudentProfile from '../models/StudentProfile.js';
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

// @desc    Get My Results (Student)
// @route   GET /api/results/my
// @access  Private (Student)
export const getMyResults = asyncHandler(async (req, res) => {
    // Step 1: Resolve User → StudentProfile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    if (!studentProfile) {
        res.status(404);
        throw new Error('Student profile not found for this account');
    }

    // Step 2: Fetch all published results for this student
    const results = await Result.find({ studentId: studentProfile._id })
        .populate({
            path: 'examId',
            select: 'name type class academicYear isPublished',
            match: { isPublished: true }  // Only return published exam results
        })
        .sort({ createdAt: -1 });

    // Filter out any results whose exam wasn't populated (i.e., unpublished)
    const publishedResults = results.filter((r) => r.examId !== null);

    res.status(200).json({
        success: true,
        count: publishedResults.length,
        student: {
            name: studentProfile.name,
            studentId: studentProfile.studentId,
            currentClass: studentProfile.currentClass,
            rollNumber: studentProfile.rollNumber,
        },
        data: publishedResults,
    });
});

// @desc    Bulk Upsert Marks for multiple students (one POST per exam+subject)
// @route   POST /api/results/bulk-marks
// @access  Private (Admin/Teacher)
export const bulkUpsertMarks = asyncHandler(async (req, res) => {
    const { examId, subject, entries } = req.body;
    // entries: [{ studentProfileId: ObjectId, mark: Number }]

    if (!examId || !subject || !Array.isArray(entries) || entries.length === 0) {
        res.status(400);
        throw new Error('examId, subject, and entries[] are required');
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    const subjectDef = exam.subjects.find(s => s.name === subject);
    const subjectFullMarks = subjectDef ? subjectDef.fullMarks : 100;

    const results = { updated: 0, created: 0, errors: [] };

    await Promise.all(entries.map(async ({ studentProfileId, mark }) => {
        try {
            const numMark = Number(mark);
            if (isNaN(numMark) || numMark < 0) return;

            // Find or create result doc for this student + exam
            let result = await Result.findOne({ studentId: studentProfileId, examId });

            // Merge the new subject mark into existing marks map
            const existingMarks = result ? Object.fromEntries(result.marks || []) : {};
            existingMarks[subject] = numMark;

            // Recalculate total and percentage against ALL exam subjects
            let totalObtained = 0;
            let totalFullMarks = 0;
            exam.subjects.forEach(sub => {
                totalObtained += Number(existingMarks[sub.name] || 0);
                totalFullMarks += sub.fullMarks;
            });

            const percentage = totalFullMarks > 0 ? (totalObtained / totalFullMarks) * 100 : 0;
            const grade = calculateGrade(percentage);

            if (result) {
                result.marks = existingMarks;
                result.totalObtained = totalObtained;
                result.percentage = parseFloat(percentage.toFixed(2));
                result.grade = grade;
                await result.save();
                results.updated++;
            } else {
                await Result.create({
                    studentId: studentProfileId,
                    examId,
                    marks: existingMarks,
                    totalObtained,
                    percentage: parseFloat(percentage.toFixed(2)),
                    grade
                });
                results.created++;
            }
        } catch (err) {
            results.errors.push(`${studentProfileId}: ${err.message}`);
        }
    }));

    res.status(200).json({
        success: true,
        message: `Bulk marks saved: ${results.updated} updated, ${results.created} created`,
        ...results
    });
});

// @desc    Public roll-number lookup — only published results
// @route   GET /api/results/public?rollNumber=X
// @access  Public (no auth)
export const getPublicResult = asyncHandler(async (req, res) => {
    const { rollNumber } = req.query;
    if (!rollNumber) {
        res.status(400);
        throw new Error('rollNumber query param is required');
    }

    const profile = await StudentProfile.findOne({ rollNumber }).populate('user', 'name email');
    if (!profile) {
        res.status(404);
        throw new Error('No student found with that roll number');
    }

    // Get only published results
    const results = await Result.find({ studentId: profile._id })
        .populate({
            path: 'examId',
            select: 'name type class academicYear subjects isPublished',
            match: { isPublished: true }
        })
        .sort({ createdAt: -1 });

    const published = results.filter(r => r.examId !== null);

    res.json({
        success: true,
        student: {
            name: profile.user?.name || profile.name,
            rollNumber: profile.rollNumber,
            class: profile.class,
            section: profile.section
        },
        results: published
    });
});

// @desc    Get full report card for print (admin)
// @route   GET /api/results/report-card/:studentProfileId/:examId
// @access  Private (Admin / Teacher)
export const getReportCard = asyncHandler(async (req, res) => {
    const { studentProfileId, examId } = req.params;

    const [profile, result, exam] = await Promise.all([
        StudentProfile.findById(studentProfileId).populate('user', 'name email'),
        Result.findOne({ studentId: studentProfileId, examId }),
        Exam.findById(examId)
    ]);

    if (!profile) { res.status(404); throw new Error('Student not found'); }
    if (!exam)    { res.status(404); throw new Error('Exam not found'); }

    res.json({
        success: true,
        data: {
            student: {
                name: profile.user?.name || profile.name,
                studentId: profile.studentId,
                rollNumber: profile.rollNumber,
                class: profile.class,
                section: profile.section,
                session: profile.session
            },
            exam: {
                name: exam.name,
                type: exam.type,
                academicYear: exam.academicYear,
                subjects: exam.subjects
            },
            result: result ? {
                marks: result.marks,
                totalObtained: result.totalObtained,
                percentage: result.percentage,
                grade: result.grade,
                rank: result.rank
            } : null
        }
    });
});

