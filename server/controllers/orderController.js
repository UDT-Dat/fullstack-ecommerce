const Order = require('../models/Order');
const emailService = require('../services/emailService');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email phone')
            .populate('products.product', 'title image type category price');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadOrders = async (req, res) => {
    try {
        const orders = await Order.find({ isReadAdmin: false })
            .sort({ createdAt: -1 })
            .select('_id user totalPrice createdAt status')
            .populate('user', 'name');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { isReadAdmin: true }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Marked as read", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { products, shippingAddress, discountCode } = req.body;

        let subtotal = 0;
        const Product = require('../models/Product');
        for (let item of products) {
            const productDoc = await Product.findById(item.product);
            if (!productDoc) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

            // Deduct stock for bottled products
            if (productDoc.type === 'bottled') {
                if (productDoc.stock < item.quantity) {
                    return res.status(400).json({ message: `Sản phẩm ${productDoc.title} không đủ số lượng tồn kho!`});
                }
                productDoc.stock -= item.quantity;
                await productDoc.save();
            }

            subtotal += (item.price * item.quantity);
        }

        let calculatedTotal = subtotal + 15000; // shipping fee
        let memberDiscountAmt = 0;

        // Apply membership discount
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user && user.isMember) {
            const TIER_LEVELS = { 'Chưa tham gia': 0, 'Mới': 0, 'Đồng': 1, 'Vàng': 2, 'Kim Cương': 3 };
            const validOrdersCount = await Order.countDocuments({ user: req.user.id, status: { $in: ['Completed', 'Delivered'] } });
            
            let computedTier = 'Mới';
            if (validOrdersCount >= 30) computedTier = 'Kim Cương';
            else if (validOrdersCount >= 20) computedTier = 'Vàng';
            else if (validOrdersCount >= 10) computedTier = 'Đồng';

            let tier = computedTier;
            if (user.manualTier && user.manualTier !== 'none' && TIER_LEVELS[user.manualTier] > TIER_LEVELS[computedTier]) {
                tier = user.manualTier;
            }

            let memberPercentage = 0;
            if (tier === 'Kim Cương') memberPercentage = 15;
            else if (tier === 'Vàng') memberPercentage = 10;
            else if (tier === 'Đồng') memberPercentage = 5;

            memberDiscountAmt = subtotal * (memberPercentage / 100);
        }

        calculatedTotal -= memberDiscountAmt;

        // Apply voucher discount (stacks on top of membership)
        if (discountCode) {
            const Discount = require('../models/Discount');
            const discountDoc = await Discount.findOne({ code: discountCode });
            if (discountDoc && discountDoc.isActive) {
                const voucherDiscountAmt = calculatedTotal * (discountDoc.discountPercentage / 100);
                calculatedTotal -= voucherDiscountAmt;
                discountDoc.usedCount += 1;
                await discountDoc.save();
            }
        }

        const newOrder = new Order({
            user: req.user.id,
            products,
            totalPrice: calculatedTotal,
            shippingAddress,
            discountCode
        });
        const savedOrder = await newOrder.save();

        if (user && user.email) {
            emailService.sendOrderNotificationEmail(user.email, savedOrder).catch(err => console.error("Order email failed:", err));
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('products.product');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product').populate('user', 'name email');
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
