import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './utils/core/allException.filter';
import { MinioService } from './minio/minio.service';
import { LogsMiddleware } from './logger/middleware/logs.middleware';
import DatabaseLogger from './logger/helpers/databaseLogger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger/logger.module';
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
import { UserService } from './admin/user/user.service';
import { CreateUserDto } from './admin/user/dto/createUser.dto';
import { RoleEnum } from './helpers/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      // validate,
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: ['entity/**/.entity.ts'],
        migrations: ['src/migrations/*.ts'],
        migrationsTableName: 'custom_migration_table',
        autoLoadEntities: true,
        synchronize: true,
        logger: new DatabaseLogger(),
      }),
    }),
    // CacheModule.registerAsync<RedisClientOptions>({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: 'redis',
    //     ttl: 60,
    //     host: configService.getOrThrow<string>('REDIS_HOST'),
    //     port: configService.getOrThrow<number>('REDIS_PORT'),
    //     username: configService.getOrThrow<string>('REDIS_USERNAME'),
    //     password: configService.getOrThrow<string>('REDIS_PASSWORD'),
    //     no_ready_check: true,
    //   }),
    // }),
    TerminusModule.forRoot(),
    LoggerModule,
    // HealthModule,
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
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
  async onModuleInit() {
    const adminUser: CreateUserDto = {
      firstName: 'admin',
      password: 'Admin123!',
      role: RoleEnum.admin,
    };
    const user = await this.userService.isAdminUserExists(adminUser.firstName);
    if (!user) {
      await this.userService.createUser(user);
    } else {
      return console.log('Default admin user already exists');
    }
  }
}
