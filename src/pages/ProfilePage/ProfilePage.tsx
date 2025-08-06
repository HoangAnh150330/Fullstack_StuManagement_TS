import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select, Button, message } from 'antd';
import type { SelectProps } from 'antd';
import moment, { type Moment } from 'moment';
import { studentAPI } from '../../services/student_api';
import type { ProfileData } from '../../types/profile';
import './Profile.css';

// Định nghĩa kiểu cho dữ liệu phản hồi từ API
interface APIResponse {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  province?: string;
}

const { Option } = Select;

const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    province: '',
  });
  const [provinces, setProvinces] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy thông tin user từ localStorage
  const userLocal = JSON.parse(localStorage.getItem('user') || '{}') as { _id: string } | null;
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchProvinces();
    if (userLocal?._id && token) {
      fetchUserProfile();
    }
  }, [userLocal?._id, token]);

  const fetchUserProfile = async () => {
    try {
      if (!userLocal?._id || !token) {
        message.error("Không tìm thấy thông tin người dùng.");
        return;
      }
      setLoading(true);
      const data: APIResponse = await studentAPI.getUserProfile(userLocal._id, token);

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dob: data.dob || '',
        province: data.province || '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải thông tin người dùng.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
      if (!res.ok) throw new Error("Không thể kết nối đến API tỉnh.");
      const data = await res.json();
      const options = data.map((prov: { name: string }) => ({
        label: prov.name,
        value: prov.name,
      }));
      setProvinces(options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không tải được danh sách tỉnh.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!userLocal?._id || !token) {
        message.error("Không tìm thấy thông tin người dùng để cập nhật.");
        return;
      }
      const updatedStudent = await studentAPI.update(userLocal._id, formData, token);
      console.log("Cập nhật thành công:", updatedStudent);
      message.success("Đã lưu thông tin!");
      // Cập nhật localStorage nếu cần
      const updatedUser = { ...userLocal, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu. Kiểm tra lại thông tin.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <form className="profile-form">
        <h2 className="form-title">Thông tin cá nhân</h2>

        <div className="form-group">
          <label>Họ và tên</label>
          <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <Input value={formData.email} disabled />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <Select
            style={{ width: '100%' }}
            value={formData.gender}
            onChange={(val) => handleChange('gender', val)}
            placeholder="Chọn giới tính"
          >
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
          </Select>
        </div>

        <div className="form-group">
          <label>Ngày sinh</label>
          <DatePicker
            style={{ width: '100%' }}
            value={formData.dob ? moment(formData.dob, 'YYYY-MM-DD') : null}
            onChange={(date: Moment | null, dateString: string) => handleChange('dob', dateString)}
            placeholder="Chọn ngày sinh"
            format="YYYY-MM-DD"
          />
        </div>

        <div className="form-group">
          <label>Tỉnh/Thành Phố</label>
          <Select
            showSearch
            options={provinces}
            value={formData.province}
            onChange={(val) => handleChange('province', val)}
            placeholder="Chọn tỉnh/thành phố"
          />
        </div>

        <Button type="primary" loading={loading} onClick={handleSave} className="save-btn">
          Lưu thông tin
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;