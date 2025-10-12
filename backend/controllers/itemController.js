import Item from '../models/Item.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user.id }).populate('user', 'name email');
  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
export const createItem = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;
  const item = await Item.create(req.body);

  res.status(201).json({
    success: true,
    data: item
  });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = asyncHandler(async (req, res) => {
  let item = await Item.findOne({ _id: req.params.id, user: req.user.id });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: item
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  await Item.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {}
  });
});