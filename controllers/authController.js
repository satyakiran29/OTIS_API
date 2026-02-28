const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const sendOtp = async (req, res) => {
    const { email, name } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otpCode = generateOtp();

        // Save or update OTP for email
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        const emailSent = await sendEmail({
            email,
            subject: 'Your Registration OTP - Temple Info System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to Temple Info System, ${name || 'User'}!</h2>
                    <p>Your One-Time Password (OTP) for registration is:</p>
                    <h1 style="color: #d35400; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        if (emailSent) {
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ message: 'Error sending OTP email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const register = async (req, res) => {
    const { name, email, password, mobile, otp } = req.body;
    const { isValid, errors } = require('../utils/passwordValidator')(password);

    if (!isValid) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Verify OTP
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
        });

        if (user) {
            // Delete OTP after successful registration
            await Otp.deleteOne({ email });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            // If OTP is not provided, generate and send it
            if (!otp) {
                const otpCode = generateOtp();
                await Otp.findOneAndUpdate(
                    { email },
                    { otp: otpCode, createdAt: Date.now() },
                    { upsert: true, new: true }
                );

                const emailSent = await sendEmail({
                    email,
                    subject: 'Your Login OTP - Temple Info System',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Hello ${user.name},</h2>
                            <p>Your One-Time Password (OTP) to securely login is:</p>
                            <h1 style="color: #2980b9; letter-spacing: 5px;">${otpCode}</h1>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you did not request this, please secure your account.</p>
                        </div>
                    `
                });

                if (emailSent) {
                    return res.status(200).json({ requiresOtp: true, message: 'OTP sent to your email' });
                } else {
                    return res.status(500).json({ message: 'Error sending OTP email' });
                }
            }

            // If OTP is provided, verify it
            const otpRecord = await Otp.findOne({ email, otp });
            if (!otpRecord) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Cleanup OTP
            await Otp.deleteOne({ email });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpCode = generateOtp();

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        const emailSent = await sendEmail({
            email,
            subject: 'Password Reset - Temple Info System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Hello ${user.name},</h2>
                    <p>We received a request to reset your password. Your One-Time Password (OTP) is:</p>
                    <h1 style="color: #e74c3c; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email or secure your account.</p>
                </div>
            `
        });

        if (emailSent) {
            res.status(200).json({ message: 'Password reset OTP sent to your email' });
        } else {
            res.status(500).json({ message: 'Error sending OTP email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const { isValid, errors } = require('../utils/passwordValidator')(newPassword);
    if (!isValid) {
        return res.status(400).json({ message: errors.join(', ') });
    }

    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, sendOtp, forgotPassword, verifyOtp, resetPassword };
