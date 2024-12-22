const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totpSecret: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    console.log('Hashing password before saving:', this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Hashed password:', this.password);
    next();
});

module.exports = mongoose.model('Admin', adminSchema);