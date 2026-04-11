const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, getUnreadOrders, markAsRead } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createOrder);
router.get('/', getAllOrders);
router.get('/unread', getUnreadOrders);
router.get('/myorders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/read', markAsRead);

module.exports = router;
