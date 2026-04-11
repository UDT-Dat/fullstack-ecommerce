const User = require('../models/User');
const Order = require('../models/Order');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        
        const orderStats = await Order.aggregate([
            { $match: { status: { $in: ['Completed', 'Delivered'] } } },
            { $group: { _id: "$user", count: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" } } }
        ]);

        const statsMap = {};
        orderStats.forEach(item => {
            statsMap[item._id.toString()] = { count: item.count, totalSpent: item.totalSpent };
        });

        const usersWithStats = users.map(u => {
            const stats = statsMap[u._id.toString()] || { count: 0, totalSpent: 0 };
            
            const TIER_LEVELS = { 'Chưa tham gia': 0, 'Mới': 0, 'Đồng': 1, 'Vàng': 2, 'Kim Cương': 3 };
            let computedTier = 'Mới';
            if (stats.count >= 30) computedTier = 'Kim Cương';
            else if (stats.count >= 20) computedTier = 'Vàng';
            else if (stats.count >= 10) computedTier = 'Đồng';

            let tier = computedTier;
            if (u.manualTier && u.manualTier !== 'none' && TIER_LEVELS[u.manualTier] > TIER_LEVELS[computedTier]) {
                tier = u.manualTier;
            }

            return { ...u, computedTier: tier, validOrdersCount: stats.count, totalSpent: stats.totalSpent };
        });

        res.status(200).json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'staff', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Role không hợp lệ" });
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: "User không tồn tại" });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        // Don't allow changing sensitive info via this endpoint
        delete updates.password;
        delete updates.role;
        delete updates.username;

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password;
        const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'User không tồn tại' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getMembershipStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        if (!user.isMember) {
            return res.status(200).json({ isMember: false, ordersCount: 0, tier: 'Chưa tham gia', discountPercentage: 0 });
        }

        const validOrdersCount = await Order.countDocuments({ user: req.user.id, status: { $in: ['Completed', 'Delivered'] } });
        
        const TIER_LEVELS = { 'Chưa tham gia': 0, 'Mới': 0, 'Đồng': 1, 'Vàng': 2, 'Kim Cương': 3 };
        let computedTier = 'Mới';
        if (validOrdersCount >= 30) computedTier = 'Kim Cương';
        else if (validOrdersCount >= 20) computedTier = 'Vàng';
        else if (validOrdersCount >= 10) computedTier = 'Đồng';

        let tier = computedTier;
        if (user.manualTier && user.manualTier !== 'none' && TIER_LEVELS[user.manualTier] > TIER_LEVELS[computedTier]) {
            tier = user.manualTier;
        }

        let discountPercentage = 0;
        if (tier === 'Kim Cương') discountPercentage = 15;
        else if (tier === 'Vàng') discountPercentage = 10;
        else if (tier === 'Đồng') discountPercentage = 5;

        res.status(200).json({
            isMember: true,
            ordersCount: validOrdersCount,
            tier,
            discountPercentage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.joinMembership = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { isMember: true }, { new: true });
        res.status(200).json({ message: "Chúc mừng! Bạn đã tham gia hạng mục khách hàng thân thiết.", user });
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

exports.toggleMembership = async (req, res) => {
    try {
        const { isMember } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isMember }, { new: true });
        res.status(200).json(user);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

exports.updateUserTier = async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['none', 'Đồng', 'Vàng', 'Kim Cương'].includes(tier)) {
            return res.status(400).json({ message: "Hạng mức không hợp lệ" });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { manualTier: tier }, { new: true });
        res.status(200).json({ message: "Cập nhật hạng thành viên thành công", user });
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};
