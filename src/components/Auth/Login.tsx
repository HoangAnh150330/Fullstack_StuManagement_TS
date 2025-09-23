// src/components/Auth/Login.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd";

import { loginAPI } from "../../services/auth_api";
import { setUser } from "../../redux/auth-slice";
import type { ErrorResponse } from "../../types/error";

type UserRole = "admin" | "teacher" | "student";

interface LoginProps {
  setMessage: (msg: string) => void;
  form: { email: string; password: string };
  setForm: (form: {
    email: string;
    password: string;
    confirmPassword?: string;
    otp?: string;
  }) => void;
}

export default function Login({ setMessage, form, setForm }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      // loginAPI đã chuẩn hoá để luôn trả { token, user }
      const { token, user } = await loginAPI({
        email: form.email,
        password: form.password,
      });

      if (!token || !user) {
        setMessage("Không nhận được token hoặc thông tin người dùng. Đăng nhập thất bại.");
        return;
      }

      // Lưu vào Redux theo đúng shape AuthUser (token nằm trong user)
      dispatch(
        setUser({
          _id: user._id,
          email: user.email,
          role: user.role as UserRole,
          token,
        })
      );

      // Lưu thêm token để dùng cho lần mở app sau (fallback cho interceptor)
      localStorage.setItem("token", token);

      setMessage("Đăng nhập thành công!");

      // Điều hướng theo role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const e = err as Partial<ErrorResponse> & { message?: string };
      const msg = e?.response?.data?.message || e?.message || "Đăng nhập thất bại.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const onEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-form">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        onKeyDown={onEnterPress}
        className="mb-3"
        autoComplete="email"
      />
      <Input.Password
        name="password"
        placeholder="Mật khẩu"
        value={form.password}
        onChange={handleChange}
        onKeyDown={onEnterPress}
        className="mb-3"
        autoComplete="current-password"
      />
      <Button
        type="primary"
        block
        onClick={handleLogin}
        loading={loading}
        className="mt-1"
      >
        Đăng nhập
      </Button>
    </div>
  );
}
