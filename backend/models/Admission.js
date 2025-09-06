import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  previousSchool: { type: String },
  class: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  documents: [{ name: String, url: String, uploadDate: { type: Date, default: Date.now } }]
}, { timestamps: true });

admissionSchema.index({ email: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ class: 1 });

const Admission = mongoose.model("Admission", admissionSchema);
export default Admission;
