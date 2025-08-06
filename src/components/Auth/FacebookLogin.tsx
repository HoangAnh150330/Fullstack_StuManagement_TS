import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/auth-slice";
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
    FB: {
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
    fbAsyncInit: () => void;
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
  setForm: (formUpdater: (prevForm: FormState) => FormState) => void;
}

export default function FacebookLogin({ setMessage, setForm }: FacebookLoginProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Khởi tạo Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: "2176727902805288", 
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      } catch (error) {
        console.error("Error initializing Facebook SDK:", error);
      }
    };

    (function (d, s, id) {
      const js = d.createElement(s) as HTMLScriptElement;
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = () => console.log("Facebook SDK loaded successfully");
      js.onerror = () => console.error("Failed to load Facebook SDK");
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
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
          // Lấy thông tin user từ FB
          window.FB.api<FacebookUserResponse>(
            "/me",
            { fields: "id,name,email" },
            async (userResponse) => {
              if (userResponse) {
                try {
                  // Gọi API backend để lưu hoặc tìm user
                  const { data } = await axios.post("http://localhost:3000/api/auth/facebook-login", {
                    facebookId: userResponse.id,
                    email: userResponse.email || "",
                    name: userResponse.name || ""
                  });

                  // Lưu vào Redux + localStorage
                  dispatch(setAuth({ token: data.token, user: data.user }));
                  localStorage.setItem("token", data.token);

                  // Cập nhật form email nếu có
                  setForm((prevForm) => ({ ...prevForm, email: data.user.email }));

                  setMessage("Đăng nhập bằng Facebook thành công!");
                  navigate("/");
                } catch (error) {
                  console.error("Lỗi khi lưu user vào DB:", error);
                  setMessage("Không thể lưu thông tin vào hệ thống.");
                }
              } else {
                setMessage("Không thể lấy thông tin người dùng từ Facebook.");
              }
              setLoading(false);
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
      style={{ marginTop: 12 }}
    >
      Đăng nhập bằng Facebook
    </Button>
  );
}
