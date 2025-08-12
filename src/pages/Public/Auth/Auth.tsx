import { useState } from "react";
import Register from "../../../components/Auth/Register";
import Login from "../../../components/Auth/Login";
import FacebookLogin from "../../../components/Auth/FacebookLogin";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-200 to-sky-200 p-5">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {message && (
          <p className="mb-3 text-sm text-green-600 text-center">{message}</p>
        )}

        {isLogin ? (
          <>
            {/* Form Login */}
            <div className="w-full flex flex-col gap-4">
              <Login
                setMessage={setMessage}
                form={{ email: form.email, password: form.password }}
                setForm={(newForm) => setForm((prev) => ({ ...prev, ...newForm }))}
              />
              <FacebookLogin
                setMessage={setMessage}
                form={{ email: form.email }}
                setForm={(updater) => setForm((prev) => updater(prev))}
              />
            </div>
          </>
        ) : (
          // Form Register (đã dùng Tailwind trong component con)
          <div className="w-full">
            <Register
              setMessage={setMessage}
              setIsLogin={setIsLogin}
              setStep={setStep}
              step={step}
              form={form}
              setForm={setForm}
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
