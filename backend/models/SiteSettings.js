import mongoose from 'mongoose';

const heroImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, default: '' }, // ImageKit file ID for deletion
  caption: { type: String, default: '' },
}, { _id: true });

const siteSettingsSchema = new mongoose.Schema({
  // Singleton key — only ever one document with key='main'
  key: { type: String, default: 'main', unique: true },

  heroImages: {
    type: [heroImageSchema],
    default: [],
  },

  headmaster: {
    name:        { type: String, default: '' },
    designation: { type: String, default: 'Headmaster' },
    message:     { type: String, default: '' },
    photoUrl:    { type: String, default: '' },
    photoFileId: { type: String, default: '' },
  },
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
