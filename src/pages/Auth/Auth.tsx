import React , {useState} from 'react';
import {Tabs , Form , Input , Button , message} from "antd";
import type {TabsProps} from "antd";
import { loginAPI, registerAPI } from "../../services/auth_api"
import type { LoginPayLoad , RegisterPayLoad } from "../../types/auth"
import "./auth.css"
const AuthPage: React.FC =() => {
  const [loading , setLoading] =useState(false);
  //hàm xử lý đăng nhập
  const onLogin = async (values:LoginPayLoad) =>{ 
    setLoading(true);
    try{
      await loginAPI(values);
      message.success("Đăng nhập thành công!");
    } catch(error){
      message.error("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  }

  //Hàm xử lý đăng ký
  const onRegister =async (values :RegisterPayLoad) =>{
    if(values.password !== values.confirmPassword){
      message.error("Mật khẩu xác nhận không khớp.")
      return;
    }
    setLoading(true);
    try{
      await registerAPI(values);
      message.success("Đăng ký thành công.");
    } catch(error){
      message.error("Đăng ký thất bại.")
    } finally{
      setLoading(false);
    }
  }

  //Form Đăng nhập
  const LoginForm = (
    <Form onFinish={onLogin} layout="vertical">
      <Form.Item name="email" label="Email" rules={[{required:true,type:'email'}]}>
        <Input/>
      </Form.Item>
      <Form.Item name="password" label="Mật khẩu" rules={[{required:true}]}>
        <Input.Password/>
      </Form.Item>
      <Form.Item >
        <Button name="submit" type="primary" loading={loading} block>
          Đăng Nhập
        </Button>
      </Form.Item>
    </Form>
  )

  //Form Đăng ký
  const RegisterForm = (
    <Form onFinish={onRegister} layout="vertical">
      <Form.Item name="email" label="Email" rules={[{required:true,type:'email'}]}>
        <Input/>
      </Form.Item>
      <Form.Item name="password" label="Mật khẩu" rules={[{required:true}]}>
        <Input.Password/>
      </Form.Item>
      <Form.Item name="confirmpassword" label="Xác nhận mật khẩu" rules={[{required:true}]}>
        <Input.Password/>
      </Form.Item>
      <Form.Item >
        <Button name="submit" type="primary" loading={loading} block>
          Đăng Ký
        </Button>
      </Form.Item>
    </Form>
  )

  const items:TabsProps["items"] =[
    { key:"login", label:"Đăng nhập", children: LoginForm},
    { key:"register", label:"Đăng ký", children: RegisterForm},
  ]
  
  return (
    <div className="auth-container">
      <Tabs defaultActiveKey="Login" items={items} centered/>
    </div>
  )
} 
export default AuthPage;