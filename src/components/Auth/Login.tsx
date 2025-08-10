import { useState } from "react";
import { loginAPI } from "../../services/auth_api";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/auth-slice";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import type { ErrorResponse } from "../../types/error";

interface LoginProps {
  setMessage: (msg: string) => void;
  form: { email: string; password: string };
  setForm: (form: {
    email: string; password: string; confirmPassword?: string; otp?: string;
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

      const res = await loginAPI({ email: form.email, password: form.password });

      const { token, user } = res as {
        token?: string;
        user?: { _id: string; email: string; role: "admin" | "teacher" | "student" };
      };

      if (!token || !user) {
        setMessage("Không nhận được token hoặc thông tin người dùng. Đăng nhập thất bại.");
        return;
      }

      dispatch(setUser({ _id: user._id, email: user.email, role: user.role, token }));

      setMessage("Đăng nhập thành công!");
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      let msg = "Đăng nhập thất bại.";
      const e = err as Partial<ErrorResponse> & { message?: string };
      msg = e?.response?.data?.message || e?.message || msg;
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="mb-3"
      />
      <Input.Password
        name="password"
        placeholder="Mật khẩu"
        value={form.password}
        onChange={handleChange}
        className="mb-3"
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
