import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../helpers/entities/baseEntity.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @ApiProperty({ type: 'string', description: 'Users refresh token' })
  @Column({ type: 'text', nullable: false })
  refreshToken: string;

  @ApiProperty({ type: () => UserEntity })
  @OneToOne(() => UserEntity, (user) => user.token, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
