import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/auth-slice";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import axios from "axios";

interface FacebookUserResponse {
  id: string;
  name: string;
  email?: string;
}

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse: { accessToken: string; userID: string } | null; status: string }) => void,
        options: { scope: string }
      ) => void;
      api: <T>(
        path: string,
        params: { fields: string },
        callback: (response: T | null) => void
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FormState {
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
}

interface FacebookLoginProps {
  setMessage: (msg: string) => void;
  form: { email: string };
  setForm: (updater: (prev: FormState) => FormState) => void;
}

export default function FacebookLogin({ setMessage, setForm }: FacebookLoginProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      try {
        window.FB?.init({
          appId: "2176727902805288",
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      } catch (error) {
        console.error("Error initializing Facebook SDK:", error);
      }
    };

    const id = "facebook-jssdk";
    if (!document.getElementById(id)) {
      const js = document.createElement("script");
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = () => console.log("Facebook SDK loaded successfully");
      js.onerror = () => console.error("Failed to load Facebook SDK");
      document.body.appendChild(js);
    }
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setMessage("Facebook SDK chưa tải. Vui lòng thử lại sau.");
      return;
    }

    setLoading(true);

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          window.FB?.api<FacebookUserResponse>(
            "/me",
            { fields: "id,name,email" },
            async (fbUser) => {
              try {
                if (!fbUser) throw new Error("Không thể lấy thông tin người dùng Facebook.");

                const { data } = await axios.post("http://localhost:3000/api/auth/facebook-login", {
                  facebookId: fbUser.id,
                  email: fbUser.email || "",
                  name: fbUser.name || "",
                });

                const { token, user } = data as {
                  token: string;
                  user: { _id: string; email: string; role: "admin" | "teacher" | "student" };
                };

                dispatch(setUser({ _id: user._id, email: user.email, role: user.role, token }));
                setForm((prev) => ({ ...prev, email: user.email }));

                setMessage("Đăng nhập bằng Facebook thành công!");
                navigate(user.role === "admin" ? "/admin" : "/");
              } catch (error) {
                console.error("Lỗi khi xử lý đăng nhập Facebook:", error);
                setMessage("Không thể đăng nhập bằng Facebook. Vui lòng thử lại.");
              } finally {
                setLoading(false);
              }
            }
          );
        } else {
          setMessage("Đăng nhập bằng Facebook thất bại.");
          setLoading(false);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <Button
      type="default"
      block
      onClick={handleFacebookLogin}
      loading={loading}
      className="mt-3"
    >
      Đăng nhập bằng Facebook
    </Button>
  );
}
