const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, updateProfile, updateUserProfile, getProfile, deleteUser, getMembershipStatus, joinMembership, toggleMembership, updateUserTier } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', getAllUsers); 
router.get('/profile', auth, getProfile);
router.get('/membership', auth, getMembershipStatus);
router.put('/join-membership', auth, joinMembership);
router.put('/:id/membership', auth, toggleMembership);
router.put('/:id/tier', auth, updateUserTier);
router.put('/:id/role', auth, updateUserRole);
router.put('/:id/profile', auth, updateUserProfile); // Admin update any user
router.put('/profile', auth, updateProfile); // Current logged in user
router.delete('/:id', auth, deleteUser); // Delete user

module.exports = router;
