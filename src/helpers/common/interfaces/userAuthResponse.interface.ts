import { UserEntity } from 'src/admin/user/entities/user.entity';

export class AuthResponse {
  user: UserEntity;

  message: string;

  accessToken: string;

  refreshToken: string;
}
