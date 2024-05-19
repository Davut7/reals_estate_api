import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/admin/user/entities/user.entity';

export class LoginDto extends PickType(UserEntity, [
  'firstName',
  'password',
] as const) {}
