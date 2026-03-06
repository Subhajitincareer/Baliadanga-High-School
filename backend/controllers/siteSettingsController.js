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
  const { schoolInfo, theme, contact, footer, map, ticker, popup, idCard } = req.body;
  const settings = await getOrCreate();

  if (schoolInfo) {
    Object.assign(settings.schoolInfo, schoolInfo);
    settings.markModified('schoolInfo');
  }
  if (theme) {
    Object.assign(settings.theme, theme);
    settings.markModified('theme');
  }
  if (contact) {
    Object.assign(settings.contact, contact);
    settings.markModified('contact');
  }
  if (footer) {
    Object.assign(settings.footer, footer);
    settings.markModified('footer');
  }
  if (map) {
    Object.assign(settings.map, map);
    settings.markModified('map');
  }
  if (ticker) {
    Object.assign(settings.ticker, ticker);
    settings.markModified('ticker');
  }
  if (popup) {
    Object.assign(settings.popup, popup);
    settings.markModified('popup');
  }
  if (idCard) {
    Object.assign(settings.idCard, idCard);
    settings.markModified('idCard');
  }

  await settings.save();
  res.json({ success: true, data: settings });
});
