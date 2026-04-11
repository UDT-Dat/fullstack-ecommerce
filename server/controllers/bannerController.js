const Banner = require('../models/Banner');

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1 });
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const count = await Banner.countDocuments();
        const banner = new Banner({ ...req.body, order: req.body.order ?? count });
        const saved = await banner.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const deleted = await Banner.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Banner not found" });
        res.status(200).json({ message: "Banner deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
