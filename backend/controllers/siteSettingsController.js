import asyncHandler from '../middlewares/asyncHandler.js';
import SiteSettings from '../models/SiteSettings.js';

// Helper: get or create the singleton settings document
const getOrCreate = async () => {
  let settings = await SiteSettings.findOne({ key: 'main' });
  if (!settings) {
    settings = await SiteSettings.create({ key: 'main' });
  }
  return settings;
};

// @desc    Get site settings (public)
// @route   GET /api/site-settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  res.json({ success: true, data: settings });
});

// @desc    Update hero images
// @route   PUT /api/site-settings/hero-images
// @access  Private (admin)
export const updateHeroImages = asyncHandler(async (req, res) => {
  const { heroImages } = req.body;
  if (!Array.isArray(heroImages)) {
    return res.status(400).json({ success: false, message: 'heroImages must be an array' });
  }
  const settings = await getOrCreate();
  settings.heroImages = heroImages;
  await settings.save();
  res.json({ success: true, data: settings });
});

// @desc    Update headmaster info
// @route   PUT /api/site-settings/headmaster
// @access  Private (admin)
export const updateHeadmaster = asyncHandler(async (req, res) => {
  const { name, designation, message, photoUrl, photoFileId } = req.body;
  const settings = await getOrCreate();
  if (name        !== undefined) settings.headmaster.name        = name;
  if (designation !== undefined) settings.headmaster.designation = designation;
  if (message     !== undefined) settings.headmaster.message     = message;
  if (photoUrl    !== undefined) settings.headmaster.photoUrl    = photoUrl;
  if (photoFileId !== undefined) settings.headmaster.photoFileId = photoFileId;
  await settings.save();
  res.json({ success: true, data: settings });
});

// @desc    Update general settings (schoolInfo, theme, contact, footer, map, ticker, popup)
// @route   PUT /api/site-settings/general
// @access  Private (admin)
export const updateGeneral = asyncHandler(async (req, res) => {
  const { schoolInfo, theme, contact, footer, map, ticker, popup } = req.body;
  const settings = await getOrCreate();

  if (schoolInfo) {
    settings.schoolInfo = { ...settings.schoolInfo.toObject?.() ?? settings.schoolInfo, ...schoolInfo };
  }
  if (theme) {
    settings.theme = { ...settings.theme.toObject?.() ?? settings.theme, ...theme };
  }
  if (contact) {
    settings.contact = { ...settings.contact.toObject?.() ?? settings.contact, ...contact };
  }
  if (footer) {
    settings.footer = { ...settings.footer.toObject?.() ?? settings.footer, ...footer };
  }
  if (map) {
    settings.map = { ...settings.map.toObject?.() ?? settings.map, ...map };
  }

  if (ticker) {
    settings.ticker = { ...settings.ticker.toObject?.() ?? settings.ticker, ...ticker };
  }
  if (popup) {
    settings.popup = { ...settings.popup.toObject?.() ?? settings.popup, ...popup };
  }

  settings.markModified('schoolInfo');
  settings.markModified('theme');
  settings.markModified('contact');
  settings.markModified('footer');
  settings.markModified('map');
  settings.markModified('ticker');
  settings.markModified('popup');

  await settings.save();
  res.json({ success: true, data: settings });
});
