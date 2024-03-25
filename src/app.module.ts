import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './utils/core/allException.filter';
import { MinioService } from './minio/minio.service';
import { LogsMiddleware } from './logger/middleware/logs.middleware';
import DatabaseLogger from './logger/helpers/databaseLogger';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './utils/health/health.module';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from './admin/auth/auth.module';
import { TokenModule } from './admin/token/token.module';
import { UserModule } from './admin/user/user.module';
import { MailsModule } from './mails/mails.module';
import { SharedModule } from './shared/shared.module';
import { MediaModule } from './media/media.module';
import { RedisModule } from './redis/redis.module';
import { PropertyModule } from './property/property.module';
import { AreasModule } from './areas/areas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env` }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['entity/**/.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      migrationsTableName: 'custom_migration_table',
      autoLoadEntities: true,
      synchronize: true,
      logger: new DatabaseLogger(),
    }),
    TerminusModule.forRoot(),
    LoggerModule,
    HealthModule,
    AuthModule,
    TokenModule,
    UserModule,
    MailsModule,
    SharedModule,
    MediaModule,
    RedisModule,
    PropertyModule,
    AreasModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    MinioService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
