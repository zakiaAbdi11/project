const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public / Authenticated
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Admin only
const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'Utensils',
    });

    res.status(201).json({ success: true, message: 'Category created successfully.', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin only
const updateCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;

    await category.save();

    res.json({ success: true, message: 'Category updated successfully.', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin only
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if items belong to this category
    const itemCount = await MenuItem.countDocuments({ category_id: category._id });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${itemCount} menu item(s) linked to this category.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
