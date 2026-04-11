const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { register, login, getAllUsers, deleteUser, sendOtp, verifyLoginOtp, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-login', verifyLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);
router.get('/', getAllUsers); // Admin route
router.delete('/:id', deleteUser); // Admin route

module.exports = router;
