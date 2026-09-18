export interface User {
  id: number;
  username: string;
  fullName: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponseData {
  token: string;
  user: User;
}