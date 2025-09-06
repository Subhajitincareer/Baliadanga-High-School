import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "userType" },
  userType: { type: String, required: true, enum: ["Staff", "Student"] },
  role: { type: String, required: true, enum: ["Admin", "Teacher", "Student", "Principal", "Vice Principal", "Coordinator"] },
  permissions: [{
    module: { type: String, required: true, enum: ["Users", "Admissions", "Results", "Announcements", "Staff", "Students", "Reports"] },
    actions: [{ type: String, enum: ["Create", "Read", "Update", "Delete"] }]
  }],
  isActive: { type: Boolean, default: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  assignedDate: { type: Date, default: Date.now }
}, { timestamps: true });

userRoleSchema.index({ userId: 1, userType: 1 }, { unique: true });


const UserRole = mongoose.model("UserRole", userRoleSchema);
export default UserRole;
