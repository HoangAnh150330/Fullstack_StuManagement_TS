import React, { useMemo, useState } from "react";
import { Form, Input, Button } from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { RootState } from "../../../redux/store";
import { changePasswordAPI } from "../../../services/auth_api";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const RuleItem = ({ ok, text }: { ok: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={ok ? "text-green-600" : "text-slate-400"}>{ok ? "✔" : "•"}</span>
    <span className={ok ? "text-green-700" : "text-slate-500"}>{text}</span>
  </div>
);

const ChangePasswordPage: React.FC = () => {
  const authUser = useSelector((s: RootState) => s.auth.user);
  const userId = authUser?._id;
  const token = authUser?.token ?? "";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const current = Form.useWatch("currentPassword", form);
  const next = Form.useWatch("newPassword", form);
  const confirm = Form.useWatch("confirmPassword", form);

  const rules = useMemo(() => {
    const length = (next ?? "").length >= 6;
    const lower = /[a-z]/.test(next ?? "");
    const upper = /[A-Z]/.test(next ?? "");
    const digit = /\d/.test(next ?? "");
    const special = /[^A-Za-z0-9]/.test(next ?? "");
    return { length, lower, upper, digit, special };
  }, [next]);

  const canSubmit =
    !!current &&
    !!next &&
    !!confirm &&
    next === confirm &&
    next !== current &&
    PWD_REGEX.test(next || "");

const handleSubmit = async () => {
  if (!authUser) {
    toast.error("Bạn cần đăng nhập.");
    return;
  }
  if (!canSubmit) {
    toast.warn("Mật khẩu mới chưa đạt yêu cầu.");
    return;
  }

  // 🔒 Thu hẹp kiểu để hết lỗi TS
  if (!userId || !token) {
    toast.error("Thiếu thông tin phiên đăng nhập. Vui lòng đăng nhập lại.");
    return;
  }
  if (!current || !next) {
    toast.error("Vui lòng nhập đầy đủ mật khẩu.");
    return;
  }

  try {
    setLoading(true);
    await changePasswordAPI(
      userId, // giờ TS hiểu là string
      { currentPassword: current, newPassword: next }, // current/next đã được guard
      token
    );
    toast.success("Đổi mật khẩu thành công!");
    form.resetFields();
  } catch (err: unknown) {
    let msg = "Đổi mật khẩu không thành công.";
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    msg = e?.response?.data?.message ?? e?.message ?? msg;
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};


  if (!authUser) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-slate-600">Bạn cần đăng nhập để xem trang này.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-violet-100 p-5">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
          Đổi mật khẩu
        </h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại." }]}>
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới." },
              {
                validator: (_, value) =>
                  value && PWD_REGEX.test(value)
                    ? Promise.resolve()
                    : Promise.reject("Tối thiểu 6 ký tự, gồm chữ thường/hoa, số và ký tự đặc biệt."),
              },
              {
                validator: (_, value) =>
                  value && value === current
                    ? Promise.reject("Mật khẩu mới không được trùng mật khẩu hiện tại.")
                    : Promise.resolve(),
              },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <RuleItem ok={rules.length} text="≥ 6 ký tự" />
            <RuleItem ok={rules.lower} text="Có chữ thường (a-z)" />
            <RuleItem ok={rules.upper} text="Có chữ hoa (A-Z)" />
            <RuleItem ok={rules.digit} text="Có số (0-9)" />
            <RuleItem ok={rules.special} text="Có ký tự đặc biệt (!@#...)" />
          </div>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject("Mật khẩu xác nhận không khớp.");
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} className="w-full h-11 text-base font-semibold" disabled={!canSubmit}>
            Đổi mật khẩu
          </Button>
        </Form>

        <p className="text-xs text-slate-500 mt-4">
          Gợi ý: Tránh dùng thông tin dễ đoán (ngày sinh, số điện thoại). Hãy dùng cụm từ có cả ký tự đặc biệt.
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordPage;