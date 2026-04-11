const Order = require('../models/Order');
const User = require('../models/User');
const Discount = require('../models/Discount');

exports.getDashboardStats = async (req, res) => {
    try {
        const { timeframe = 'week' } = req.query;
        const now = new Date();
        
      
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        const newOrders = await Order.countDocuments();
        const newCustomers = await User.countDocuments({ role: 'user' });
        
        const activeVouchers = await Discount.countDocuments({
            expiryDate: { $gt: now },
            $expr: { $lt: ["$usedCount", "$usageLimit"] }
        });

        let chartData = [];

        if (timeframe === 'week') {
       
            const past7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            const rawData = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: past7Days } } },
                { $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" }
                } },
                { $sort: { _id: 1 } }
            ]);

            for (let i = 0; i < 7; i++) {
                const day = new Date(past7Days);
                day.setDate(day.getDate() + i);
                const dayStr = day.toISOString().split('T')[0];
                const found = rawData.find(d => d._id === dayStr);
                
                let dayLabel = day.toLocaleDateString('vi-VN', { weekday: 'short' });
             
                chartData.push({
                    name: dayLabel,
                    revenue: found ? found.revenue : 0
                });
            }
        } else if (timeframe === 'month') {
         
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const rawData = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfMonth } } },
                { $group: { 
                    _id: { $week: "$createdAt" },
                    revenue: { $sum: "$totalPrice" }
                } },
                { $sort: { _id: 1 } }
            ]);
            
          
            for (let i = 1; i <= 4; i++) {
                chartData.push({
                    name: `Tuần ${i}`,
                    revenue: rawData[i-1] ? rawData[i-1].revenue : 0
                });
            }
        } else if (timeframe === 'year') {
       
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const rawData = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfYear } } },
                { $group: { 
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalPrice" }
                } },
                { $sort: { _id: 1 } }
            ]);

            for (let i = 1; i <= 12; i++) {
                const found = rawData.find(d => d._id === i);
                chartData.push({
                    name: `Thg ${i}`,
                    revenue: found ? found.revenue : 0
                });
            }
        }

        res.status(200).json({
            overview: {
                totalRevenue,
                newOrders,
                newCustomers,
                activeVouchers
            },
            chartData
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: error.message });
    }
};
