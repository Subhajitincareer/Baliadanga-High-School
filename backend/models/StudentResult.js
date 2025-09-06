import mongoose from "mongoose";

const studentResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  examType: { type: String, required: true, enum: ["Unit Test", "Mid Term", "Final Exam", "Annual", "Monthly Test"] },
  academicYear: { type: String, required: true },
  subjects: [{
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    fullMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    grade: { type: String, enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"] },
    remarks: String
  }],
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  overallGrade: { type: String, enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"] },
  rank: { type: Number },
  publishDate: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true }
}, { timestamps: true });

studentResultSchema.pre("save", function (next) {
  this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
  if (this.percentage >= 90) this.overallGrade = "A+";
  else if (this.percentage >= 80) this.overallGrade = "A";
  else if (this.percentage >= 70) this.overallGrade = "B+";
  else if (this.percentage >= 60) this.overallGrade = "B";
  else if (this.percentage >= 50) this.overallGrade = "C+";
  else if (this.percentage >= 40) this.overallGrade = "C";
  else if (this.percentage >= 35) this.overallGrade = "D";
  else this.overallGrade = "F";
  next();
});

studentResultSchema.index({ studentId: 1, examType: 1, academicYear: 1 });
studentResultSchema.index({ class: 1, section: 1 });


const StudentResult = mongoose.model("StudentResult", studentResultSchema);
export default StudentResult;