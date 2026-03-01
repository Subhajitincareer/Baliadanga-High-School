import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        required: [true, 'Please add a Student ID'],
        unique: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Please add a Roll Number']
    },
    class: {
        type: String,
        required: [true, 'Please add a Class']
    },
    // Kept in sync with `class` — used by promotionController and eligibility check
    currentClass: {
        type: String
    },
    section: {
        type: String,
        required: [true, 'Please add a Section']
    },
    session: {
        type: String, // e.g. '2024-2025'
        default: ''
    },
    // Archive of past promotions
    previousClasses: [{
        class: String,
        section: String,
        session: String,
        percentage: Number,
        grade: String,
        promotedAt: { type: Date, default: Date.now }
    }],
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    guardianName: {
        type: String,
        required: [true, 'Please add Guardian Name']
    },
    guardianPhone: {
        type: String,
        required: [true, 'Please add Guardian Phone']
    },
    address: {
        type: String
    },
    photoUrl: {
        type: String
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Alumni', 'Suspended'],
        default: 'Active'
    },
    ePortalDetails: {
        aadhaarNo: String,
        nameAsPerAadhaar: String,
        motherTongue: String,
        socialCategory: String,
        religion: String,
        heightCms: String,
        weightKgs: String,
        isBplBeneficiary: String, // Yes/No
        isAayBeneficiary: String, // Yes/No
        bplNo: String,
        belongsToEws: String, // Yes/No
        isCwsn: String, // Yes/No
        cwsnDisabilityPercent: String,
        cwsnImpairmentType: String,
        specificLearningDisabilityType: String,
        nationality: String,
        isOutOfSchoolChild: String, // Yes/No
        bloodGroup: String,
        identificationMark: String,
        healthId: String,
        relationshipWithGuardian: String,
        annualFamilyIncome: String,
        guardianQualification: String,
        admissionNumberInSchool: String,
        admittedEnrolledUnder: String,
        admissionDateEportal: String,
        statusInPreviousYear: String,
        appearedForExamsPreviousYear: String, // Yes/No
        resultPreviousYear: String,
        marksPercentagePreviousYear: String,
        daysAttendedPreviousYear: String,
        previousClassStudied: String,
        facilitiesGiven: String,
        freeUniforms: String, // Yes/No
        freeTransport: String, // Yes/No
        freeEscort: String, // Yes/No
        freeHostel: String, // Yes/No
        freeBicycle: String, // Yes/No
        freeMobileTablet: String, // Yes/No
        vocationalCourse: String, // Yes/No
        tradeSector: String,
        jobRole: String,
        capableOfHandlingDigitalDevices: String // Yes/No
    }
}, {
    timestamps: true
});

// Composite index to ensure unique roll number per class/section/year could be added, 
// but for now keeping it simple.

export default mongoose.model('StudentProfile', studentProfileSchema);
