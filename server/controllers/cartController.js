const Cart = require('../models/Cart');

// GET /api/cart — fetch the logged-in user's server cart
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'title image price type stock sizes options');
        res.status(200).json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/cart — replace the entire cart (full sync from client)
exports.syncCart = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ message: 'Items must be an array' });

        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items },
            { upsert: true, new: true }
        );
        res.status(200).json(cart.items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/cart — clear cart on logout or after checkout
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
