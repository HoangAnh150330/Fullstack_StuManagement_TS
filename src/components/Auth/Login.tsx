import { useState } from "react";
import { loginAPI } from "../../services/auth_api";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/auth-slice";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import type { ErrorResponse } from "../../types/error";

interface LoginProps {
  setMessage: (msg: string) => void;
  form: { email: string; password: string };
  setForm: (form: { email: string; password: string; confirmPassword?: string; otp?: string }) => void;
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
      const response = await loginAPI({
        email: form.email,
        password: form.password,
      });

      const { token, user } = response;

      if (!token || !user) {
        setMessage("Không nhận được token hoặc thông tin người dùng. Đăng nhập thất bại.");
        return;
      }

      dispatch(setAuth({ token, user }));

      setMessage("Đăng nhập thành công!");
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      let errorMessage = "Đăng nhập thất bại.";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as ErrorResponse;
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      setMessage(errorMessage);
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
        style={{ marginBottom: 12 }}
      />
      <Input.Password
        name="password"
        placeholder="Mật khẩu"
        value={form.password}
        onChange={handleChange}
        style={{ marginBottom: 12 }}
      />
      <Button
        type="primary"
        block
        onClick={handleLogin}
        loading={loading}
      >
        Đăng nhập
      </Button>
    </div>
  );
}