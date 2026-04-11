const express = require('express');
const router = express.Router();
const { getCart, syncCart, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getCart);
router.put('/', auth, syncCart);
router.delete('/', auth, clearCart);

module.exports = router;
