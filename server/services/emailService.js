const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

const sendOTPVerificationEmail = async (email, otp) => {
    try {
        const data = await resend.emails.send({
            from: `Vitality <${SENDER_EMAIL}>`,
            to: [email],
            subject: 'Xác minh tài khoản - Mã OTP của bạn',
            html: `
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
        return data;
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw error;
    }
};

const sendOrderNotificationEmail = async (email, orderDetails) => {
    try {
        const data = await resend.emails.send({
            from: `Vitality <${SENDER_EMAIL}>`,
            to: [email],
            subject: `Xác nhận đặt hàng thành công #${orderDetails._id.toString().slice(-6).toUpperCase()}`,
            html: `
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
        return data;
    } catch (error) {
        console.error("Failed to send order email:", error);
        throw error;
    }
};

module.exports = {
    sendOTPVerificationEmail,
    sendOrderNotificationEmail
};
