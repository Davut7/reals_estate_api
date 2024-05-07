import { UserEntity } from 'src/admin/user/entities/user.entity';

export class TokenDto {
  id: string;
  firstName: string;
  role: string;

  constructor(entity: UserEntity) {
    this.id = entity.id;
    this.firstName = entity.firstName;
    this.role = entity.role;
  }
}
