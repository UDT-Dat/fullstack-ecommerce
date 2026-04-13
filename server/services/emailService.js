const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'ungdat8@gmail.com';
const SENDER_NAME = 'Vitality Coffee';

// Hàm gọi Brevo REST API qua HTTPS (cổng 443 - không bị Render chặn)
const sendEmail = async ({ to, subject, htmlContent }) => {
    const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent,
        },
        {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};

const sendOTPVerificationEmail = async (email, otp) => {
    try {
        return await sendEmail({
            to: email,
            subject: 'Xác minh tài khoản - Mã OTP của bạn',
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 12px; max-width: 500px; margin: 0 auto; color: #1e293b;">
                    <h2 style="color: #f59e0b; text-align: center;">Mã Xác Minh OTP</h2>
                    <p style="font-size: 16px;">Xin chào,</p>
                    <p style="font-size: 16px;">Bạn vừa yêu cầu mã OTP để đăng nhập/đăng ký tài khoản. Mã xác minh của bạn là:</p>
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #0f172a;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">Mã này sẽ hết hạn sau <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send OTP email via Brevo:", error?.response?.data || error.message);
        throw error;
    }
};

const sendOrderNotificationEmail = async (email, orderDetails) => {
    try {
        return await sendEmail({
            to: email,
            subject: `Xác nhận đặt hàng thành công #${orderDetails._id.toString().slice(-6).toUpperCase()}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                    <h2 style="color: #10b981;">Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã tin tưởng. Đơn hàng của bạn đang được xử lý.</p>
                    <ul>
                        <li><strong>Mã đơn hàng:</strong> ${orderDetails._id}</li>
                        <li><strong>Tổng tiền:</strong> ${orderDetails.totalPrice.toLocaleString()} đ</li>
                        <li><strong>Địa chỉ giao:</strong> ${orderDetails.shippingAddress}</li>
                    </ul>
                    <p>Chúng tôi sẽ giao hàng nhanh nhất có thể!</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send order email via Brevo:", error?.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendOTPVerificationEmail,
    sendOrderNotificationEmail
};

