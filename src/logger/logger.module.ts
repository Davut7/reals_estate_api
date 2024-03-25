import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import CustomLogger from './helpers/customLogger';
import { LogsEntity } from './entity/log.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([LogsEntity]), SharedModule],
  controllers: [LoggerController],
  providers: [LoggerService, CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
