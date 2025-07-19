export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  joinDate?: Date;
  profileImage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}