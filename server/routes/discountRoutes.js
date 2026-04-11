const express = require('express');
const router = express.Router();
const { getAllDiscounts, createDiscount, deleteDiscount, validateDiscount } = require('../controllers/discountController');

router.post('/validate', validateDiscount);
router.get('/', getAllDiscounts);
router.post('/', createDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
