import { useState } from "react";
import {
  registerAPI,
  verifyOTPAPI,
  loginAPI,
} from "../../services/auth_api";
import "./auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerAPI({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      setStep("otp");
      setMessage("OTP đã gửi về email của bạn.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      await verifyOTPAPI({
        email: form.email,
        otp: form.otp,
      });
      setIsLogin(true);
      setStep("form");
      setMessage("Xác minh OTP thành công. Hãy đăng nhập.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginAPI({ email: form.email, password: form.password });
      setMessage("Đăng nhập thành công!");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="auth-container">
    <div className="auth-card">
      <h2 className="auth-title">{isLogin ? "Đăng nhập" : "Đăng ký"}</h2>

      {message && <p className="message">{message}</p>}

      <div className="auth-form">
        {isLogin || step === "form" ? (
          <>
            {!isLogin && (
              <input
                type="text"
                name="fullName"
                placeholder="Họ tên"
                value={form.fullName}
                onChange={handleChange}
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />
            <button
              className="auth-button"
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              name="otp"
              placeholder="Nhập mã OTP"
              value={form.otp}
              onChange={handleChange}
            />
            <button
              className="auth-button"
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "Xác minh OTP"}
            </button>
          </>
        )}
      </div>

      <p className="auth-switch">
        {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
        <span
          onClick={() => {
            setIsLogin(!isLogin);
            setStep("form");
            setMessage("");
          }}
        >
          {isLogin ? " Đăng ký ngay" : " Đăng nhập"}
        </span>
      </p>
    </div>
  </div>
);

}
