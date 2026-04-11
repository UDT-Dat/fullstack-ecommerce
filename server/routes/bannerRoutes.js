const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAllBanners, getAdminBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');

router.get('/', getAllBanners);
router.get('/admin', auth, getAdminBanners);
router.post('/', auth, createBanner);
router.put('/:id', auth, updateBanner);
router.delete('/:id', auth, deleteBanner);

module.exports = router;
