import { UserEntity } from 'src/admin/user/entities/user.entity';

export class TokenDto {
  id: string;
  name: string;
  role: string;

  constructor(entity: UserEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.role = entity.role;
  }
}
