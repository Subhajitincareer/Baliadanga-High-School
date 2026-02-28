import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, default: '' },
  caption: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Campus', 'Events', 'Activities', 'Other'],
    default: 'Campus'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('GalleryImage', galleryImageSchema);
