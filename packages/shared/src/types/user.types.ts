export type UserRole = 'customer' | 'admin';

export interface UserPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
