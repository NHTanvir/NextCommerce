import type { UserRole } from '@nextcommerce/shared';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: UserRole;
  googleId?: string | null;
  createdAt!: Date;
}
