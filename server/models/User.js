const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    address: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
    isMember: { type: Boolean, default: false },
    manualTier: { type: String, enum: ['none', 'Đồng', 'Vàng', 'Kim Cương'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
