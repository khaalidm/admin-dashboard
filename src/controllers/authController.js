const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register a new admin
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = new Admin({ email, password });
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Login admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

