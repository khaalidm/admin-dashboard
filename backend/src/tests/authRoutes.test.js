// src/tests/authRoutes.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const authController = require('../controllers/authController');

// Mock mailjet
jest.mock('node-mailjet', () => {
    return {
        apiConnect: jest.fn().mockReturnValue({
            post: jest.fn().mockReturnValue({
                request: jest.fn().mockResolvedValue({ body: { success: true } })
            })
        })
    };
});

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

jest.mock('../controllers/authController');

describe('Auth Routes', () => {
    it('should login admin', async () => {
        authController.loginAdmin.mockImplementation((req, res) => res.status(200).send('Login successful'));
        const response = await request(app).post('/auth/login').send({ username: 'admin', password: 'password' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Login successful');
    });

    it('should register admin', async () => {
        authController.registerAdmin.mockImplementation((req, res) => res.status(201).send('Registration successful'));
        const response = await request(app).post('/auth/register').send({ username: 'admin', password: 'password' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('Registration successful');
    });

    it('should handle forgot password', async () => {
        authController.forgotPassword.mockImplementation((req, res) => res.status(200).send('Forgot password email sent'));
        const response = await request(app).post('/auth/forgot-password').send({ email: 'admin@example.com' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Forgot password email sent');
    });

    it('should reset password', async () => {
        authController.resetPassword.mockImplementation((req, res) => res.status(200).send('Password reset successful'));
        const response = await request(app).post('/auth/reset-password').send({ token: 'token', newPassword: 'newPassword' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Password reset successful');
    });

    it('should setup TOTP', async () => {
        authController.totpSetup.mockImplementation((req, res) => res.status(200).send({ qrCodeUrl: 'http://example.com/qrcode' }));
        const response = await request(app).post('/auth/totp-setup').send({ email: 'admin@example.com' });
        expect(response.status).toBe(200);
        expect(response.body.qrCodeUrl).toBe('http://example.com/qrcode');
    });

    it('should verify TOTP', async () => {
        authController.verifyTotp.mockImplementation((req, res) => res.status(200).send('TOTP verified'));
        const response = await request(app).post('/auth/verify-totp').send({ token: '123456' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('TOTP verified');
    });
});