const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public / Authenticated
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Admin only
const updateSettings = async (req, res) => {
  try {
    const { restaurant_name, address, phone, currency_symbol, tax_percentage, receipt_header, receipt_footer } =
      req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (restaurant_name) settings.restaurant_name = restaurant_name.trim();
    if (address !== undefined) settings.address = address.trim();
    if (phone !== undefined) settings.phone = phone.trim();
    if (currency_symbol !== undefined) settings.currency_symbol = currency_symbol.trim();
    if (tax_percentage !== undefined) settings.tax_percentage = Number(tax_percentage);
    if (receipt_header !== undefined) settings.receipt_header = receipt_header.trim();
    if (receipt_footer !== undefined) settings.receipt_footer = receipt_footer.trim();

    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully.',
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
