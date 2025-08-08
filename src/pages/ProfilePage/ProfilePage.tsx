import React, { useState, useEffect, type ChangeEvent } from 'react';
import { Input, DatePicker, Select, Button} from 'antd';
import { toast } from 'react-toastify';
import type { SelectProps } from 'antd';
import moment, { type Moment } from 'moment';
import { studentAPI } from '../../services/student_api';
import type { ProfileData } from '../../types/profile';
import { UploadOutlined } from '@ant-design/icons';
import './Profile.css';

interface APIResponse {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  province?: string;
  avatar?: string;
  message?: string;
  data?: { avatar?: string };
  error?: string;
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
    avatar: '',
  });
  const [provinces, setProvinces] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const userLocal = JSON.parse(localStorage.getItem('user') || '{}') as { _id: string, avatar?: string } | null;
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
        toast.error('Không tìm thấy thông tin người dùng.');
        return;
      }
      setLoading(true);
      const data: APIResponse = await studentAPI.getUserProfile(userLocal._id, token);
      console.log('Fetched profile data:', data);

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dob: data.dob || '',
        province: data.province || '',
        avatar: data.avatar || '',
      });
      setAvatarPreview(data.avatar || null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin người dùng.';
      console.error('Fetch profile error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
      if (!res.ok) throw new Error('Không thể kết nối đến API tỉnh.');
      const data = await res.json();
      const options = data.map((prov: { name: string }) => ({
        label: prov.name,
        value: prov.name,
      }));
      setProvinces(options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không tải được danh sách tỉnh.';
      console.error('Fetch provinces error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const filetypes = /jpeg|jpg|png/;
      if (!filetypes.test(file.type)) {
        toast.error('Chỉ hỗ trợ định dạng .png, .jpg hoặc .jpeg!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file phải nhỏ hơn 5MB!');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      console.log('Selected file:', file.name, file.size);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!userLocal?._id || !token) {
        toast.error('Không tìm thấy thông tin người dùng để cập nhật.');
        return;
      }

      // Cập nhật thông tin profile
      const updatedStudent = await studentAPI.update(userLocal._id, formData, token);
      console.log('Profile updated:', updatedStudent);

      // Tải ảnh avatar nếu có
      let newAvatar = formData.avatar;
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);
        const uploadResponse: APIResponse = await studentAPI.uploadAvatar(userLocal._id, formDataUpload, token);
        console.log('Upload response:', uploadResponse);

        newAvatar = uploadResponse.data?.avatar || uploadResponse.avatar || '';
        if (!newAvatar) {
          toast.warning('Upload ảnh thành công nhưng không nhận được URL avatar từ server.');
        } else {
          setFormData((prev) => ({ ...prev, avatar: newAvatar }));
          setAvatarPreview(newAvatar);
        }
      }

      // Cập nhật localStorage
      const updatedUser = { ...userLocal, ...formData, avatar: newAvatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Updated user in localStorage:', updatedUser);

      toast.success('Đã lưu thông tin!');
      // Reload profile để kiểm tra
      await fetchUserProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu. Kiểm tra lại thông tin.';
      console.error('Save error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">Chưa có ảnh</div>
            )}
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleAvatarChange}
            id="avatar-upload"
            style={{ display: 'none' }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="upload-btn"
          >
            Tải ảnh avatar
          </Button>
        </div>
        <form className="profile-form">
          <h2 className="form-title">Thông tin cá nhân</h2>

          <div className="form-group">
            <label>Họ và tên</label>
            <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <Input value={formData.email} disabled />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <Select
              style={{ width: '100%' }}
              value={formData.gender}
              onChange={(val) => handleChange('gender', val)}
              placeholder="Chọn giới tính"
            >
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
            </Select>
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <DatePicker
              style={{ width: '100%' }}
              value={formData.dob ? moment(formData.dob, 'YYYY-MM-DD') : null}
              onChange={(date: Moment | null, dateString: string) => handleChange('dob', dateString)}
              placeholder="Chọn ngày sinh"
              format="YYYY-MM-DD"
            />
          </div>

          <div className="form-group">
            <label>Tỉnh/Thành Phố</label>
            <Select
              showSearch
              options={provinces}
              value={formData.province}
              onChange={(val) => handleChange('province', val)}
              placeholder="Chọn tỉnh/thành phố"
            />
          </div>

          <Button type="primary" loading={loading} onClick={handleSave} className="save-btn">
            Lưu thông tin
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;