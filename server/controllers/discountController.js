const Discount = require('../models/Discount');

exports.getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.status(200).json(discounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createDiscount = async (req, res) => {
    try {
        const newDiscount = new Discount(req.body);
        const savedDiscount = await newDiscount.save();
        res.status(201).json(savedDiscount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDiscount = async (req, res) => {
    try {
        const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
        if (!deletedDiscount) return res.status(404).json({ message: "Discount not found" });
        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validateDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase() });
        
        if (!discount) return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        if (new Date(discount.expiryDate) < new Date()) return res.status(400).json({ message: "Mã giảm giá đã kết thúc" });
        if (discount.usedCount >= discount.usageLimit) return res.status(400).json({ message: "Mã giảm giá đã hết số lượng" });

        res.status(200).json({
            message: "Áp dụng thành công",
            discountPercentage: discount.discountPercentage,
            code: discount.code
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", err: error.message });
    }
};
