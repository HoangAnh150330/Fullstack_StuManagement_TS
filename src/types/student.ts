export interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  classId?: string;
}
export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}