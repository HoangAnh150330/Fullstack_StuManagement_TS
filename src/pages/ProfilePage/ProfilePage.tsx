import React, { useState , useEffect} from 'react';
import { Input, DatePicker , Select, Button, message } from 'antd';
import type { SelectProps } from 'antd';
import moment from 'moment';  
import type { ProfileData }from "../../types/profile";
import './Profile.css';
const { Option } = Select;

const ProfilePage: React.FC = () =>{
  const [formData, setFormData]=useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    province: '',
    
  })

  const [provinces , setProvinces] =useState<SelectProps['options']>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData({
      name: user.name ||'',
      email: user.email ||'',
      phone: user.phone || '',
      gender: user.gender || '',
      dob: user.dob || '',
      province: user.province ||'',
    });
    fetchProvinces();//Load danh sach tinh tP
  },[]);

  const fetchProvinces =async () =>{
    try{
      const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
      const data = await res.json();
      const options = data.map((prov :any) =>({
        label:prov.name,
        value:prov.name,
      }));
      setProvinces(options);
    } catch (error){
      message.error("Không tải được danh sách tỉnh.")
    }
  };
  
  const handleChange = (key: keyof ProfileData , value:string) =>{
    setFormData(prev =>({...prev, [key]:value}))
  };

  const handleSave =() =>{
    console.log("Thông tin lưu :",formData);
    message.success("Cập nhật thành công");
  };

  return (
    <div className="profile-container">
      <form className='profile-form'>
        <h2 className='form-title'>Thông tin cá nhân</h2>
          <div className="form-group">
            <label>Họ và tên</label>
            <Input value={formData.name} onChange={(e) =>handleChange('name' , e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <Input value={formData.email} disabled />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <Input value={formData.phone} onChange={(e) =>handleChange('phone' , e.target.value)} />
          </div>
          <div className="form-group row">
            <label>Giới tính</label>
            <Select value={formData.gender} onChange={(val)=>handleChange('gender',val) }>
              <Option value='male'>Nam</Option>
              <Option value='female'>Nữ</Option>
            </Select>
          </div>
          <div>
            <label>Ngày sinh</label>
            <DatePicker 
              style={{width:'100%'}}
              value={formData.dob ? moment(formData.dob) :null}
              onChange={(date, dateString) => handleChange('dob', dateString)}
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
          <Button type='primary' onClick={handleSave} className='save-btn'> Lưu thông tin</Button>
      </form>
    </div>
  );
};

export default ProfilePage;