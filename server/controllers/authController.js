const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng cung cấp email." });

        const otpCode = generateOTP();

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, returnDocument: 'after' }
        );

        await emailService.sendOTPVerificationEmail(email, otpCode);
        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error) {
        res.status(500).json({ message: "Không thể gửi OTP. Vui lòng thử lại sau." });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, otp, dob, gender, address, province, district, ward } = req.body;

        if (!email) return res.status(400).json({ message: "Email là bắt buộc để đăng ký." });
        if (!otp) return res.status(400).json({ message: "Vui lòng nhập mã OTP." });

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });

        const existingUser = await User.findOne({ $or: [{ email }, { phone: phone || 'XXX' }] });
        if (existingUser) return res.status(400).json({ message: "Email hoặc Số điện thoại đã được sử dụng" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const usernameFallback = email || phone || Date.now().toString();

        const newUser = new User({
            name, email, phone,
            username: usernameFallback,
            password: hashedPassword,
            dob, gender, address, province, district, ward
        });

        await newUser.save();
        await Otp.deleteOne({ email });

        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password, trustedToken } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp thông tin đăng nhập và mật khẩu" });
        }

        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }, { phone: identifier }]
        });

        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác" });

        // Skip OTP if trusted device token is still valid
        if (trustedToken) {
            try {
                const decoded = jwt.verify(trustedToken, process.env.JWT_SECRET || 'secret');
                if (decoded.id === user._id.toString()) {
                    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
                    return res.status(200).json({
                        requiresOtp: false,
                        token: newToken,
                        user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone }
                    });
                }
            } catch (_) {
                // Token expired or invalid — fall through to OTP flow
            }
        }

        if (!user.email) {
            return res.status(400).json({ message: "Tài khoản của bạn chưa cấu hình Email để nhận OTP. Vui lòng liên hệ Admin." });
        }

        const otpCode = generateOTP();
        await Otp.findOneAndUpdate(
            { email: user.email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, returnDocument: 'after' }
        );

        await emailService.sendOTPVerificationEmail(user.email, otpCode);
        res.status(200).json({ requiresOtp: true, email: user.email, message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp, rememberMe } = req.body;

        if (!email || !otp) return res.status(400).json({ message: "Vui lòng nhập mã OTP." });

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại." });

        await Otp.deleteOne({ email });

        const tokenDuration = rememberMe ? '30d' : '1d';
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: tokenDuration });

        res.status(200).json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng cung cấp email." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản với email này." });

        const otpCode = generateOTP();
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, returnDocument: 'after' }
        );

        await emailService.sendOTPVerificationEmail(email, otpCode);
        res.status(200).json({ message: "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn." });
    } catch (error) {
        console.error("forgotPassword error:", error);
        res.status(500).json({ message: "Không thể gửi OTP. Vui lòng thử lại sau." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await Otp.deleteOne({ email });

        res.status(200).json({ message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập." });
    } catch (error) {
        console.error("resetPassword error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại." });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác." });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("changePassword error:", error);
        res.status(500).json({ message: error.message });
    }
};
