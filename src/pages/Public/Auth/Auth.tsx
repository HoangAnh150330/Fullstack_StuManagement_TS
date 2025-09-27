import { useState } from "react";
import Register from "../../../components/Auth/Register";
import Login from "../../../components/Auth/Login";
import FacebookLogin from "../../../components/Auth/FacebookLogin";
import type { AuthFormState } from "../../../types/auth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState<AuthFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [message, setMessage] = useState<string>("");

  // ✅ helper để update form
  const updateForm = (newValues: Partial<AuthFormState>) =>
    setForm((prev) => ({ ...prev, ...newValues }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-200 to-sky-200 p-5">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {message && (
          <p className="mb-3 text-sm text-green-600 text-center">{message}</p>
        )}

        {isLogin ? (
          <div className="w-full flex flex-col gap-4">
            <Login
              setMessage={setMessage}
              form={{ email: form.email, password: form.password }}
              setForm={updateForm}
            />
            <FacebookLogin
              setMessage={setMessage}
              form={{ email: form.email }}
              setForm={updateForm}
            />
          </div>
        ) : (
          <div className="w-full">
            <Register
              setMessage={setMessage}
              setIsLogin={setIsLogin}
              setStep={setStep}
              step={step}
              form={form}
              setForm={updateForm}
            />
          </div>
        )}

        <p className="mt-5 text-sm text-gray-600">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            className="text-indigo-600 font-medium hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setStep("form");
              setMessage("");
            }}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
