const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cartId: { type: String, required: true }, // composite key: productId-size-options hash
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // final price with size surcharge
    size: { type: String, default: '' },
    selectedOptions: { type: Map, of: String, default: {} }, // { "Ngọt": "Bình thường", "Đá": "Ít" }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
