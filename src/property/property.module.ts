import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './entities/property.entity';
import { MediaModule } from '../media/media.module';
import { AreasModule } from 'src/areas/areas.module';
import { RedisModule } from 'src/redis/redis.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity]),
    MediaModule,
    AreasModule,
    RedisModule,
    MinioModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
