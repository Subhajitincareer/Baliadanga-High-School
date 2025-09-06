import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, required: true, enum: ["General", "Academic", "Event", "Holiday", "Emergency", "Sports"] },
  targetAudience: { type: String, required: true, enum: ["All", "Students", "Staff", "Parents"] },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  authorName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  attachments: [{ filename: String, url: String, size: Number, mimetype: String }],
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "readBy.userType" },
    userType: { type: String, enum: ["Staff", "Student"] },
    readAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ isActive: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
