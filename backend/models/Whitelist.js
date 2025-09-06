import mongoose from "mongoose";

const whitelistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, required: true, enum: ["Admin", "Teacher", "Principal", "Vice Principal", "Coordinator"] },
  department: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  isActive: { type: Boolean, default: true },
  registrationToken: { type: String, unique: true, sparse: true },
  tokenExpiry: { type: Date },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

whitelistSchema.pre("save", function (next) {
  if (this.isNew) {
    this.registrationToken = require("crypto").randomBytes(32).toString("hex");
    this.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

whitelistSchema.index({ email: 1 });
whitelistSchema.index({ registrationToken: 1 });


const Whitelist = mongoose.model("Whitelist", whitelistSchema);
export default Whitelist;

