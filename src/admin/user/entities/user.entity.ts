import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../helpers/entities/baseEntity.entity';
import { TokenEntity } from '../../token/entities/token.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from 'src/helpers/constants';
import { Expose } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @ApiProperty({
    title: 'firstName',
    name: 'firstName',
    type: String,
    description: 'User firstName',
    required: true,
    example: 'David',
  })
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'text', nullable: false })
  firstName: string;

  @ApiProperty({
    title: 'password',
    name: 'password',
    type: String,
    description:
      'User password. /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$/',
    required: true,
    example: 'Test123!',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Expose()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty({
    title: 'User role',
    name: 'role',
    description: 'User role to role based control',
    required: true,
    enum: RoleEnum,
    example: RoleEnum.admin,
  })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  @Column({ type: 'enum', enum: RoleEnum })
  role: RoleEnum;

  @ApiProperty({ type: () => TokenEntity })
  @OneToOne(() => TokenEntity, (token) => token.user)
  @JoinColumn()
  token: TokenEntity;
}
