const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');
const { toggleTwoStepVerification, updatePassword, updateProfile, deleteAccount } = require('../controllers/userController');

// Get all users (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user (Super-Admin only)
router.delete('/:id', protect, superAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'super-admin') {
                return res.status(403).json({ message: 'Cannot delete a super-admin account' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user role (Super-Admin only)
router.put('/:id/role', protect, superAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'super-admin') {
            return res.status(403).json({ message: 'Cannot modify the role of a super-admin' });
        }

        user.role = req.body.role || 'user';
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle 2SV (Authenticated user)
router.put('/profile/two-step-verification', protect, toggleTwoStepVerification);

// Update user password (Authenticated user)
router.put('/profile/password', protect, updatePassword);

// Update user profile (Authenticated user)
router.put('/profile', protect, updateProfile);

// Delete own account (Authenticated user)
router.delete('/profile', protect, deleteAccount);

module.exports = router;
