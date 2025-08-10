import { useState } from "react";
import { registerAPI, verifyOTPAPI } from "../../services/auth_api";
import { Input, Button } from "antd";
import type { ErrorResponse } from "../../types/error";

interface FormState {
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
}

interface RegisterProps {
  setMessage: (msg: string) => void;
  setIsLogin: (value: boolean) => void;
  setStep: (step: "form" | "otp") => void;
  step: "form" | "otp";
  form: FormState;
  setForm: (form: FormState) => void;
}

const RequiredLabel: React.FC<{ text: string }> = ({ text }) => (
  <span>
    {text} <span className="text-red-500 font-bold">*</span>
  </span>
);

export default function Register({
  setMessage,
  setIsLogin,
  setStep,
  step,
  form,
  setForm,
}: RegisterProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.email.trim() || !form.password.trim() || !form.confirmPassword?.trim()) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("Định dạng email không hợp lệ.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(form.password)) {
      setMessage(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      await registerAPI({
        email: form.email,
        password: form.password,
      });
      setStep("otp");
      setMessage("OTP đã gửi về email của bạn. Vui lòng xác minh.");
    } catch (err) {
      let errorMessage = "Đăng ký thất bại.";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (err && typeof err === "object" && "response" in err) {
        const apiError = err as ErrorResponse;
        errorMessage =
          apiError.response?.data?.message || errorMessage;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!form.otp) {
      setMessage("Vui lòng nhập mã OTP.");
      return;
    }

    try {
      setLoading(true);
      await verifyOTPAPI({
        email: form.email,
        otp: form.otp,
      });
      setIsLogin(true);
      setStep("form");
      setMessage(
        "Xác minh OTP thành công. Tài khoản đã được tạo. Hãy đăng nhập."
      );
      setForm({ ...form, otp: "" });
    } catch (err) {
      let errorMessage = "OTP không hợp lệ.";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (err && typeof err === "object" && "response" in err) {
        const apiError = err as ErrorResponse;
        errorMessage =
          apiError.response?.data?.message || errorMessage;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      {step === "form" ? (
        <>
          <label className="block mb-1"><RequiredLabel text="Email" /></label>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="mb-3"
          />

          <label className="block mb-1"><RequiredLabel text="Mật khẩu" /></label>
          <Input.Password
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
            className="mb-3"
          />

          <label className="block mb-1"><RequiredLabel text="Xác nhận mật khẩu" /></label>
          <Input.Password
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={form.confirmPassword || ""}
            onChange={handleChange}
            required
            className="mb-3"
          />

          <Button
            type="primary"
            block
            onClick={handleRegister}
            loading={loading}
          >
            Đăng ký
          </Button>
        </>
      ) : (
        <>
          <label className="block mb-1"><RequiredLabel text="Mã OTP" /></label>
          <Input
            type="text"
            name="otp"
            placeholder="Nhập mã OTP"
            value={form.otp || ""}
            onChange={handleChange}
            required
            className="mb-3"
          />
          <Button
            type="primary"
            block
            onClick={handleVerifyOTP}
            loading={loading}
          >
            Xác minh OTP
          </Button>
        </>
      )}
    </div>
  );
}
