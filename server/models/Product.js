const mongoose = require('mongoose');

// A size variant (e.g. M, L) with optional price surcharge
const sizeVariantSchema = new mongoose.Schema({
    label: { type: String, required: true }, // "M", "L", "XL"
    extraPrice: { type: Number, default: 0 }, // extra cost on top of base price
}, { _id: false });

// An option group row (e.g. "Sugar" with choices ["Ít", "Bình thường", "Nhiều", "Không"])
const optionGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },   // "Ngọt", "Đá", "Topping"
    choices: [{ type: String }],              // ["Ít", "Bình thường", "Nhiều", "Không"]
    defaultChoice: { type: String, default: '' },
}, { _id: false });

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['brewed', 'bottled'], default: 'brewed' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isBestSeller: { type: Boolean, default: false },
    isNewFace: { type: Boolean, default: false },
    sizes: { type: [sizeVariantSchema], default: [] },      // size choices
    options: { type: [optionGroupSchema], default: [] },    // sugar/ice/topping groups
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
