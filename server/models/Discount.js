const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
