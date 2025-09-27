export interface APIResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Upload avatar response
export interface AvatarUploadResponse {
  avatar: string;
}
