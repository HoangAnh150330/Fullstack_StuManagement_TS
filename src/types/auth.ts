export interface LoginPayLoad {
  email:string;
  password:string;
}

export interface RegisterPayLoad extends LoginPayLoad{
  confirmPassword:string;
}