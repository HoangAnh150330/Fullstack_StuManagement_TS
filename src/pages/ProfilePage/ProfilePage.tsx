import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Select, Button, message } from 'antd';
import type { SelectProps } from 'antd';
import moment from 'moment';
import { studentAPI } from '../../services/student_api';
import type { ProfileData } from '../../types/profile';
import './Profile.css';

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

  const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProvinces();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!userLocal._id || !token) return;
      const data = await studentAPI.getUserProfile(userLocal._id, token);

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dob: data.dob || '',
        province: data.province || '',
      });
    } catch (error) {
      message.error("Không thể tải thông tin người dùng.");
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
      const data = await res.json();
      const options = data.map((prov: any) => ({
        label: prov.name,
        value: prov.name,
      }));
      setProvinces(options);
    } catch (error) {
      message.error("Không tải được danh sách tỉnh.");
    }
  };

  const handleChange = (key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedStudent = await studentAPI.update(userLocal._id, formData, token as string);
      console.log("Cập nhật thành công:", updatedStudent);
      message.success("Đã lưu thông tin!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      message.error("Không thể lưu. Kiểm tra lại thông tin.");
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
            value={formData.dob ? moment(formData.dob) : null}
            onChange={(date, dateString) => handleChange('dob', dateString)}
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