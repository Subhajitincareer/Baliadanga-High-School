import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, default: '' },       // e.g. "9:00 AM - 4:00 PM"
  location: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Academic', 'Sports', 'Cultural', 'Administrative', 'Other'],
    default: 'Other'
  },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  imageFileId: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
