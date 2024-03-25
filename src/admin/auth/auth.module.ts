import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TokenEntity } from '../token/entities/token.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TokenEntity]), SharedModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
