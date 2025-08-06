import { useState } from "react";
import Register from "../../components/Auth/Register";
import Login from "../../components/Auth/Login";
import FacebookLogin from "../../components/Auth/FacebookLogin";
import "./auth.css";

// Định nghĩa kiểu dữ liệu chung
interface FormState {
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [message, setMessage] = useState("");

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Đăng nhập" : "Đăng ký"}</h2>

        {message && <p className="message">{message}</p>}

        {isLogin ? (
          <>
            <Login
              setMessage={setMessage}
              form={{ email: form.email, password: form.password }}
              setForm={(newForm) =>
                setForm((prev) => ({ ...prev, ...newForm }))
              }
            />
            <FacebookLogin
              setMessage={setMessage}
              form={{ email: form.email }}
              setForm={(formUpdater) =>
                setForm((prev) => formUpdater(prev))
              }
            />
          </>
        ) : (
          <Register
            setMessage={setMessage}
            setIsLogin={setIsLogin}
            setStep={setStep}
            step={step}
            form={form}
            setForm={setForm}
          />
        )}

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