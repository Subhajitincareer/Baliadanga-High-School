import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  position: { type: String, required: true, enum: ["Teacher", "Admin", "Principal", "Vice Principal", "Coordinator"] },
  department: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  subjects: [{ type: String }],
  classes: [{ type: String }],
  isActive: { type: Boolean, default: true },
  profileImage: { type: String }
}, { timestamps: true });

staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

staffSchema.index({ employeeId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ position: 1 });

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
