import { useState } from "react";
import {
  registerAPI,
  verifyOTPAPI,
  loginAPI,
} from "../../services/auth_api";
import "./auth.css";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/auth-slice";
import { useNavigate } from "react-router-dom";
export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

    const response = await loginAPI({
      email: form.email,
      password: form.password,
    });

    const { token, user } = response;

    if (!token || !user) {
      setMessage("Không nhận được token hoặc thông tin người dùng. Đăng nhập thất bại.");
      return;
    }

    // Dispatch vào Redux
    dispatch(setAuth({ token, user }));

    // Hiển thị thông báo và chuyển trang
    setMessage("Đăng nhập thành công!");
    console.log("Login response:", response);
    if(user.role ==="admin"){
      navigate('/admin');}
    else{
      navigate('/');
    }
    
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
