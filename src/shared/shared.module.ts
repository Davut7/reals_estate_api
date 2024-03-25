import { Module } from '@nestjs/common';
import { TokenModule } from 'src/admin/token/token.module';
import { UserModule } from 'src/admin/user/user.module';
import { MinioModule } from 'src/minio/minio.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [MinioModule, TokenModule, UserModule, RedisModule],
  providers: [],
  exports: [MinioModule, TokenModule, UserModule, RedisModule],
})
export class SharedModule {}
