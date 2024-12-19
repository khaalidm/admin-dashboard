const express = require('express');
const { loginAdmin, registerAdmin } = require('../controllers/authController');

const router = express.Router();

// Admin routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

module.exports = router;
