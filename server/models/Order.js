const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        size: { type: String, default: 'Standard' },
        selectedOptions: { type: Map, of: String, default: {} }
    }],
    totalPrice: { type: Number, required: true },
    discountCode: { type: String },
    status: { type: String, enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'], default: 'Pending' },
    shippingAddress: { type: String, required: true },
    isReadAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
