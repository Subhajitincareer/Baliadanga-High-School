import mongoose from 'mongoose';

const heroImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, default: '' },
  caption: { type: String, default: '' },
}, { _id: true });

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },

  heroImages: { type: [heroImageSchema], default: [] },

  headmaster: {
    name:        { type: String, default: '' },
    designation: { type: String, default: 'Headmaster' },
    message:     { type: String, default: '' },
    photoUrl:    { type: String, default: '' },
    photoFileId: { type: String, default: '' },
  },

  // ── School Identity ──────────────────────────────────────────
  schoolInfo: {
    name:        { type: String, default: 'Baliadanga High School' },
    tagline:     { type: String, default: 'Educating and inspiring since 1963' },
    established: { type: String, default: '1963' },
    logoUrl:     { type: String, default: '' },
  },

  // ── Theme ────────────────────────────────────────────────────
  theme: {
    primaryColor:   { type: String, default: '#1e3a5f' },
    secondaryColor: { type: String, default: '#e8b84b' },
    accentColor:    { type: String, default: '#2563eb' },
  },

  // ── Contact Info ─────────────────────────────────────────────
  contact: {
    phone:       { type: String, default: '+91 9876543210' },
    phoneAlt:    { type: String, default: '' },
    email:       { type: String, default: 'info@baliadangahs.edu' },
    emailAlt:    { type: String, default: 'admissions@baliadangahs.edu' },
    address:     { type: String, default: 'Baliadanga Rd, P.O. Baliadanga, West Bengal 741152, India' },
    officeHours: { type: String, default: 'Mon–Fri: 10:00 AM–4:00 PM\nSaturday: 10:00 AM–2:00 PM\nSunday: Closed' },
  },

  // ── Footer ───────────────────────────────────────────────────
  footer: {
    tagline:   { type: String, default: 'Educating and inspiring since 1963' },
    facebook:  { type: String, default: 'https://facebook.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    copyright: { type: String, default: '' }, // blank = auto year
  },

  // ── Map ──────────────────────────────────────────────────────
  map: {
    embedUrl:    { type: String, default: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3646.61255906547!2d88.64565342485139!3d23.93876993151946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f94fe5d5509c0b%3A0xe405765716fb9b5f!2sBaliadanga%20High%20School(H.S)%2C%20Baliadanga%2C%20West%20Bengal%20741152!5e0!3m2!1sen!2sin!4v1744342473832!5m2!1sen!2sin" },
    directionsUrl: { type: String, default: 'https://goo.gl/maps/1GqfRs6RRmEygZxP6' },
  },

  // ── Notice Ticker ────────────────────────────────────────────
  ticker: {
    active:   { type: Boolean, default: true },
    messages: { type: [String], default: ['Admission Open for Class V to IX (2025)'] },
  },

  // ── Global Popup ─────────────────────────────────────────────
  popup: {
    active:   { type: Boolean, default: false },
    title:    { type: String, default: 'Important Notice' },
    content:  { type: String, default: 'Welcome to Baliadanga High School. Please check our latest notifications.' },
    imageUrl: { type: String, default: '' },
  },

}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
