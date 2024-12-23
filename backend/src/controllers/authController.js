
const Admin = require('../models/adminModel');
const LoginAttempt = require('../models/loginAttemptModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const Joi = require('joi');
const qrcode = require('qrcode');
const { sendEmail } = require('../services/mailjetService');

// backend/src/controllers/adminController.js

exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Registering admin with email:', email);
        console.log('Original password:', password);

        const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
        const admin = new Admin({ email, password, totpSecret });
        await admin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
        console.log('Error during registration:', err.message);
        res.status(400).json({ error: err.message });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const loginAttempts = await LoginAttempt.findOne({ email });

        if (!loginAttempts) {
            console.log('No login attempts found, creating new record');
            // Redirect to TOTP setup page
            res.status(200).json({ message: 'First login, please set up TOTP', redirectTo: '/totp-setup' });
            return;
        }

        // If TOTP is already set up, prompt for TOTP verification
        res.status(200).json({ message: 'Login successful, please verify TOTP'});

        await LoginAttempt.create({ email, success: true });
        console.log(`Admin with email: ${email} logged in at ${new Date().toISOString()}`);
    } catch (err) {
        console.log('Error during login:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Email not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await admin.save();

        const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
        const msg = {
            to: email,
            from: 'your-email@example.com',
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        };

        await sendEmail(email, 'Password Reset', `You requested a password reset. Click the link to reset your password: ${resetUrl}`);

        console.log('Reset URL:', resetUrl);

        // await sgMail.send(msg);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Define password validation schema
    const schema = Joi.object({
        newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9]).{8,}$')).required()
    });

    // Validate the new password
    const { error } = schema.validate({ newPassword });
    if (error) return res.status(400).json({ error: 'Password does not meet the required criteria' });

    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!admin) return res.status(400).json({ error: 'Invalid or expired token' });

        admin.password = newPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.totpSetup = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Email not found' });

        const secret = speakeasy.generateSecret({ length: 20 });
        admin.totpSecret = secret.base32;
        await admin.save();

        const otpauthUrl = `otpauth://totp/AdminDashboard:${email}?secret=${secret.base32}&issuer=AdminDashboard`;
        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

        res.status(200).json({ qrCodeUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyTotp = async (req, res) => {
    const { email, token } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Email not found' });

        const tokenValid = speakeasy.totp.verify({
            secret: admin.totpSecret,
            encoding: 'base32',
            token: token
        });
        if (!tokenValid) {
            await LoginAttempt.create({ email, success: false });
            return res.status(400).json({ error: 'Invalid TOTP token' });
        }

        const sessionToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await LoginAttempt.create({ email, success: true });
        res.status(200).json({ message: 'TOTP verified successfully', token: sessionToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};