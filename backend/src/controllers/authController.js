
const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
        const admin = new Admin({ email, password: hashedPassword, totpSecret });
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
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

        const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
        admin.totpSecret = totpSecret;
        await admin.save();

        const totpToken = speakeasy.totp({
            secret: totpSecret,
            encoding: 'base32'
        });

        const msg = {
            to: email,
            from: 'your-email@example.com',
            subject: 'Your TOTP Code',
            text: `Your TOTP code is: ${totpToken}`
        };

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log('TOTP Token:', totpToken);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
        // await sgMail.send(msg);

        res.status(200).json({ message: 'Login successful, please check your email for the TOTP token' });
    } catch (err) {
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

        console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log('Reset URL:', resetUrl);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~");

        // await sgMail.send(msg);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!admin) return res.status(400).json({ error: 'Invalid or expired token' });

        admin.password = await bcrypt.hash(newPassword, 10);
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

        res.status(200).json({ qrCodeUrl: secret.otpauth_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.verifyTotp = async (req, res) => {
    const { email, token } = req.body;
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log('Email:', email);
    console.log('Token:', token);
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ error: 'Email not found' });

        const tokenValid = speakeasy.totp.verify({
            secret: admin.totpSecret,
            encoding: 'base32',
            token: token
        });
        if (!tokenValid) return res.status(400).json({ error: 'Invalid TOTP token' });

        const jwtToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token: jwtToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};