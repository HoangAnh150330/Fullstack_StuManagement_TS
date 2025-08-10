import React, { useState, useEffect, type ChangeEvent } from "react";
import { Input, DatePicker, Select, Button } from "antd";
import type { SelectProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { studentAPI } from "../../services/student_api";
import type { ProfileData } from "../../types/profile";

interface APIResponse {
  name?: string; email?: string; phone?: string; gender?: string;
  dob?: string; province?: string; avatar?: string;
  message?: string; data?: { avatar?: string }; error?: string;
}

const { Option } = Select;

const RequiredLabel: React.FC<{ text: string }> = ({ text }) => (
  <span>
    {text} <span className="text-red-500 font-bold">*</span>
  </span>
);

const ProfilePage: React.FC = () => {
  // ✅ Lấy user từ Redux (đã có _id, email, role, token)
  const authUser = useSelector((s: RootState) => s.auth.user);
  const userId = authUser?._id;
  const token = authUser?.token ?? "";

  const [formData, setFormData] = useState<ProfileData>({
    name: "", email: "", phone: "", gender: "", dob: "", province: "", avatar: "",
  });
  const [provinces, setProvinces] = useState<SelectProps["options"]>([]);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (userId && token) fetchUserProfile();
  }, [userId, token]); // ✅ khi Redux có user/token thì gọi API

  const fetchUserProfile = async () => {
    try {
      if (!userId || !token) return;
      setLoading(true);
      const data: APIResponse = await studentAPI.getUserProfile(userId, token);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dob: data.dob || "",
        province: data.province || "",
        avatar: data.avatar || "",
      });
      setAvatarPreview(data.avatar || null);
    } catch {
      toast.error("Không thể tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
      const data = await res.json();
      setProvinces(data.map((p: { name: string }) => ({ label: p.name, value: p.name })));
    } catch {
      toast.error("Không tải được danh sách tỉnh.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateAndSetPhone = (value: string) => {
    if (/^\d{0,10}$/.test(value)) handleChange("phone", value);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Họ và tên là bắt buộc.";
    if (!formData.phone) e.phone = "Số điện thoại là bắt buộc.";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Số điện thoại phải gồm 10 chữ số.";
    if (!formData.gender) e.gender = "Vui lòng chọn giới tính.";
    if (!formData.dob) e.dob = "Vui lòng chọn ngày sinh.";
    if (!formData.province) e.province = "Vui lòng chọn tỉnh/thành phố.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const okType = /jpeg|jpg|png/.test(file.type);
    if (!okType) return toast.error("Chỉ hỗ trợ .png, .jpg hoặc .jpeg!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Kích thước file phải < 5MB!");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!validateForm() || !userId || !token) return;
    try {
      setLoading(true);
      await studentAPI.update(userId, formData, token);

      let newAvatar = formData.avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const uploadRes = await studentAPI.uploadAvatar(userId, fd, token);
        newAvatar = (uploadRes as APIResponse).avatar || "";
        setFormData((prev) => ({ ...prev, avatar: newAvatar }));
        setAvatarPreview(newAvatar);
      }

      toast.success("Đã lưu thông tin!");
      await fetchUserProfile(); // refresh dữ liệu
    } catch {
      toast.error("Không thể lưu thông tin.");
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
      <div className="flex gap-8 items-start w-full max-w-5xl flex-wrap">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 w-64 p-5 bg-white rounded-2xl shadow-xl">
          <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500 text-base font-medium text-center">Chưa có ảnh</div>
            )}
          </div>

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleAvatarChange}
            id="avatar-upload"
            className="hidden"
          />
          <Button type="primary" icon={<UploadOutlined />} onClick={() => document.getElementById("avatar-upload")?.click()} className="w-full">
            Tải ảnh avatar
          </Button>
        </div>

        {/* Form */}
        <form className="flex-1 bg-white p-10 rounded-2xl shadow-xl min-w-[300px]">
          <h2 className="mb-6 text-2xl font-semibold text-center text-slate-800">Thông tin cá nhân</h2>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-slate-700">
              <RequiredLabel text="Họ và tên" />
            </label>
            <Input size="large" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nhập họ và tên" />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-slate-700">Email</label>
            <Input size="large" value={formData.email} disabled />
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-slate-700">
              <RequiredLabel text="Số điện thoại" />
            </label>
            <Input size="large" value={formData.phone} onChange={(e) => validateAndSetPhone(e.target.value)} maxLength={10} placeholder="0912345678" />
            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-slate-700">
              <RequiredLabel text="Giới tính" />
            </label>
            <Select size="large" value={formData.gender} onChange={(val) => handleChange("gender", val)} placeholder="Chọn giới tính" className="w-full">
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
            </Select>
            {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-slate-700">
              <RequiredLabel text="Ngày sinh" />
            </label>
            <DatePicker
              size="large"
              className="w-full"
              value={formData.dob ? dayjs(formData.dob, "YYYY-MM-DD") : null}
              onChange={(d: Dayjs | null) => handleChange("dob", d ? d.format("YYYY-MM-DD") : "")}
              placeholder="Chọn ngày sinh"
              format="YYYY-MM-DD"
            />
            {errors.dob && <div className="text-red-500 text-xs mt-1">{errors.dob}</div>}
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-slate-700">
              <RequiredLabel text="Tỉnh/Thành phố" />
            </label>
            <Select
              size="large"
              showSearch
              options={provinces}
              value={formData.province}
              onChange={(val) => handleChange("province", val)}
              placeholder="Chọn tỉnh/thành phố"
              className="w-full"
            />
            {errors.province && <div className="text-red-500 text-xs mt-1">{errors.province}</div>}
          </div>

          <Button type="primary" loading={loading} onClick={handleSave} className="w-full h-11 text-base font-semibold">
            Lưu thông tin
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
