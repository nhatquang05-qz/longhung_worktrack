export interface ManagedUser {
  id: number;
  fullName: string;
  username: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  fullName: string;
  username: string;
}