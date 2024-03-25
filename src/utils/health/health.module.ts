import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { TerminusLogger } from './terminus.logger';
import { TokenModule } from 'src/admin/token/token.module';
import { UserModule } from 'src/admin/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: TerminusLogger,
      errorLogStyle: 'pretty',
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpModule,
    UserModule,
    TokenModule,
    RedisModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
