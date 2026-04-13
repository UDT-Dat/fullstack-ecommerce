import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { CartContext } from '../context/CartContext';
import { useContext } from 'react';

const OtpBoxes = ({ values, onChange, onKeyDown, onPaste, idPrefix }) => {
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);
  return (
    <div className="flex gap-3 justify-center" onPaste={onPaste}>
      {values.map((value, idx) => (
        <input key={idx} id={`${idPrefix}-${idx}`} ref={idx === 0 ? firstRef : null}
          type="text" inputMode="numeric" maxLength="1" value={value}
          onChange={(e) => onChange(idx, e.target.value)} onKeyDown={(e) => onKeyDown(idx, e)}
          className="w-12 h-14 bg-zinc-950/80 border-2 border-zinc-800 rounded-xl text-center text-2xl font-black focus:border-amber-500 focus:bg-amber-500/5 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all text-white shadow-inner"
        />
      ))}
    </div>
  );
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', identifier: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [tempEmail, setTempEmail] = useState('');

  const [forgotStep, setForgotStep] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loadCartFromServer } = useContext(CartContext);

  useEffect(() => {
    const saved = localStorage.getItem('citrus_rememberedAcc');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(prev => ({...prev, identifier: parsed.identifier || '', password: parsed.password || ''}));
      setRememberCredentials(true);
    }
  }, []);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', identifier: '', email: '', phone: '', password: '' });
    setShowOtpModal(false);
    setOtpValues(['', '', '', '', '', '']);
    setRememberDevice(false);
    setForgotStep(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const deviceTrust = localStorage.getItem('citrus_device_trust');
        let trustedToken = null;
        if (deviceTrust) {
            const parsed = JSON.parse(deviceTrust);
            if (parsed.expiresAt > Date.now() && parsed.token) {
                trustedToken = parsed.token;
            } else {
                localStorage.removeItem('citrus_device_trust');
            }
        }

        const payload = { identifier: formData.identifier, password: formData.password, trustedToken };
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, payload);
        
        if (rememberCredentials) {
          localStorage.setItem('citrus_rememberedAcc', JSON.stringify({ identifier: formData.identifier, password: formData.password }));
        } else {
          localStorage.removeItem('citrus_rememberedAcc');
        }

        if (response.data.requiresOtp) {
            setTempEmail(response.data.email);
            setShowOtpModal(true);
            showToast("Vui lòng check email để lấy mã OTP bảo mật", "success");
        } else {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            await loadCartFromServer();
            showToast("Đăng nhập thành công!", "success");
            navigate('/');
        }
      } else {
        if (!formData.email) return showToast("Vui lòng nhập Email để nhận mã xác minh.", "error");
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, { email: formData.email });
        setTempEmail(formData.email);
        setShowOtpModal(true);
        showToast("Mã OTP đã được gửi đến email đăng ký", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Xác thực thất bại, vui lòng thử lại.", "error");
    }
  };

  const verifyOtpAndProcess = async () => {
     const otpCode = otpValues.join('');
     if (otpCode.length < 6) return showToast("Vui lòng nhập đủ 6 số OTP", "error");
     try {
        if (isLogin) {
           const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/verify-login', { email: tempEmail, otp: otpCode, rememberMe: rememberDevice });
           localStorage.setItem('token', res.data.token);
           localStorage.setItem('user', JSON.stringify(res.data.user));
            if (rememberDevice) {
                localStorage.setItem('citrus_device_trust', JSON.stringify({
                    email: tempEmail,
                    token: res.data.token,
                    trustedAt: Date.now(),
                    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
                }));
           } else {
               localStorage.removeItem('citrus_device_trust');
           }
           showToast("Đăng nhập thành công!", "success");
           await loadCartFromServer();
           navigate('/');
        } else {
           await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', { ...formData, otp: otpCode });
           showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
           setShowOtpModal(false);
           setIsLogin(true);
           setOtpValues(['', '', '', '', '', '']);
        }
     } catch (err) {
        showToast(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn", "error");
     }
  };


  const handleForgotSendOtp = async () => {
    if (!forgotEmail) return showToast("Vui lòng nhập email.", "error");
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/auth/forgot-password', { email: forgotEmail });
      showToast("Mã OTP đã được gửi đến email của bạn.", "success");
      setForgotStep('otp');
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi gửi OTP.", "error");
    }
  };

  const handleForgotVerifyOtp = () => {
    const otpCode = forgotOtp.join('');
    if (otpCode.length < 6) return showToast("Vui lòng nhập đủ 6 số OTP", "error");
    setForgotStep('newpass');
  };

  const handleForgotResetPassword = async () => {
    if (!newPassword || !confirmPassword) return showToast("Vui lòng nhập mật khẩu mới.", "error");
    if (newPassword !== confirmPassword) return showToast("Mật khẩu xác nhận không khớp.", "error");
    if (newPassword.length < 6) return showToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
    try {
      const otpCode = forgotOtp.join('');
      await axios.post(import.meta.env.VITE_API_URL + '/api/auth/reset-password', { email: forgotEmail, otp: otpCode, newPassword });
      showToast("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", "success");
      setForgotStep(null);
      setForgotEmail('');
      setForgotOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi đặt lại mật khẩu.", "error");
    }
  };


  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      setOtpValues(paste.split(''));
      document.getElementById('otp-5')?.focus();
      e.preventDefault();
    }
  };

  const handleForgotOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const arr = [...forgotOtp];
    arr[index] = value;
    setForgotOtp(arr);
    if (value && index < 5) document.getElementById(`forgot-otp-${index + 1}`).focus();
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`).focus();
    }
  };

  const handleForgotOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      setForgotOtp(paste.split(''));
      document.getElementById('forgot-otp-5')?.focus();
      e.preventDefault();
    }
  };


  if (forgotStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden text-white font-body selection:bg-amber-500 selection:text-zinc-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 shadow-2xl flex-col items-center rounded-[2.5rem] p-10 sm:p-14 max-w-[460px] w-full mx-4 relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-amber-500 rounded-b-full"></div>

          {forgotStep === 'email' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-500 text-4xl">lock_reset</span>
              </div>
              <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-2">Quên mật khẩu</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">Nhập email đã đăng ký để nhận mã xác minh</p>
              
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Nhập email của bạn..."
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner mb-6" />

              <button onClick={handleForgotSendOtp} type="button" className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-widest text-sm mb-4">
                GỬI MÃ XÁC MINH
              </button>
              <button onClick={() => setForgotStep(null)} type="button" className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                Quay lại đăng nhập
              </button>
            </div>
          )}

          {forgotStep === 'otp' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-500 text-4xl">mark_email_unread</span>
              </div>
              <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-2">Xác minh OTP</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Mã gồm 6 chữ số đã gửi đến<br/><span className="text-white font-bold">{forgotEmail}</span>
              </p>

              <div className="mb-8">
                <OtpBoxes values={forgotOtp} onChange={handleForgotOtpChange} onKeyDown={handleForgotOtpKeyDown} onPaste={handleForgotOtpPaste} idPrefix="forgot-otp" />
              </div>

              <button onClick={handleForgotVerifyOtp} type="button" className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-widest text-sm mb-4">
                XÁC NHẬN
              </button>
              <button onClick={() => setForgotStep('email')} type="button" className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                Quay lại
              </button>
            </div>
          )}

          {forgotStep === 'newpass' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-green-500/20">
                <span className="material-symbols-outlined text-green-500 text-4xl">vpn_key</span>
              </div>
              <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-2">Mật khẩu mới</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">Nhập mật khẩu mới cho tài khoản của bạn</p>

              <div className="space-y-4 mb-6 text-left">
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Ít nhất 6 ký tự..." minLength="6"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner pr-12" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Xác nhận mật khẩu</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu..."
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner" />
                </div>
              </div>

              <button onClick={handleForgotResetPassword} type="button" className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-widest text-sm mb-4">
                ĐẶT LẠI MẬT KHẨU
              </button>
              <button onClick={() => setForgotStep('otp')} type="button" className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                Quay lại
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden text-white font-body selection:bg-amber-500 selection:text-zinc-900">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800 shadow-2xl flex-col items-center rounded-[2.5rem] p-10 sm:p-14 max-w-[460px] w-full mx-4 relative z-10 transition-all duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-amber-500 rounded-b-full"></div>

        {!showOtpModal ? (
            <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-zinc-700">
                  <span className="material-symbols-outlined text-amber-500 text-3xl">token</span>
              </div>
              <h1 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">Vitality</h1>
              <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mt-3">{isLogin ? 'Cổng thành viên' : 'Đăng ký Hội viên'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Họ và tên</label>
                  <input type="text" required className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner" placeholder="Nguyễn Văn A" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              )}
              
              {isLogin ? (
                  <div>
                    <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email / Số điện thoại</label>
                    <input type="text" required value={formData.identifier} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner" placeholder="Nhập email hoặc SĐT..." onChange={(e) => setFormData({...formData, identifier: e.target.value})} />
                  </div>
              ) : (
                 <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email *</label>
                        <input type="email" required className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner" placeholder="email@..." onChange={(e) => setFormData({...formData, email: e.target.value})} />
                     </div>
                     <div className="flex-1">
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Số ĐT</label>
                        <input type="tel" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner" placeholder="09..." onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                     </div>
                 </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength="6" value={formData.password} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-amber-500 outline-none transition-all font-bold text-white placeholder-zinc-700 shadow-inner pr-12" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 px-1">
                 {isLogin ? (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={rememberCredentials} onChange={() => setRememberCredentials(!rememberCredentials)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 focus:ring-offset-2 accent-amber-500" />
                      <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">Ghi nhớ đăng nhập</span>
                    </label>
                 ) : (
                    <span className="text-[10px] text-zinc-500 italic">Bảo mật OTP đa lớp an toàn.</span>
                 )}
                 {isLogin && <button onClick={() => setForgotStep('email')} type="button" className="text-[10px] font-black uppercase text-zinc-500 hover:text-amber-500 transition-colors tracking-widest shrink-0">Quên MK?</button>}
              </div>

              <div className="pt-6">
                 <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
                   {isLogin ? 'Đăng Nhập' : 'Mở Thẻ Thành Viên'}
                 </button>
              </div>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-zinc-800/50">
              <button onClick={toggleAuth} type="button" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center justify-center w-full group">
                {isLogin ? (
                    <>Chưa có tài khoản? <span className="text-amber-500 ml-2 group-hover:underline">Đăng ký ngay</span></>
                ) : (
                    <>Đã là hội viên? <span className="text-amber-500 ml-2 group-hover:underline">Đăng nhập</span></>
                )}
              </button>
            </div>
            </>
        ) : (
            <div className="text-center">
               <div className="w-20 h-20 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
                  <span className="material-symbols-outlined text-amber-500 text-4xl">mark_email_unread</span>
               </div>
               <h2 className="text-2xl font-headline font-black text-white uppercase tracking-tight mb-2">Nhập mã OTP</h2>
               <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                  Một mã số gồm 6 chữ số vừa được gửi đến<br/> 
                  <span className="text-white font-bold">{tempEmail}</span>
               </p>

               <div className="mb-8">
                  <OtpBoxes values={otpValues} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} onPaste={handleOtpPaste} idPrefix="otp" />
               </div>

               {isLogin && (
                  <label className="flex items-center justify-center gap-3 cursor-pointer group mb-8 mx-auto">
                     <input type="checkbox" checked={rememberDevice} onChange={() => setRememberDevice(!rememberDevice)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 focus:ring-offset-2 accent-amber-500" />
                     <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">Nhớ thiết bị này trong 30 ngày</span>
                  </label>
               )}

               <div className="flex flex-col gap-4">
                  <button onClick={verifyOtpAndProcess} type="button" className="w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
                      XÁC NHẬN
                  </button>
                  <button onClick={() => { setShowOtpModal(false); setOtpValues(['', '', '', '', '', '']); setRememberDevice(false); }} type="button" className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors mt-2">
                     Quay Lại
                  </button>
               </div>
            </div>
        )}
        
        {!showOtpModal && (
            <div className="mt-8 text-center flex justify-center">
                <button onClick={() => navigate('/')} type="button" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all">
                   <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
