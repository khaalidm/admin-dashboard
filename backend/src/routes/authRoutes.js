const express = require('express');
const { loginAdmin, registerAdmin, forgotPassword, resetPassword, totpSetup, verifyTotp } = require('../controllers/authController');

const router = express.Router();

// Admin routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/totp-setup', totpSetup);
router.post('/verify-totp', verifyTotp);

module.exports = router;