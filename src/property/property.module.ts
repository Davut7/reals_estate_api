import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './entities/property.entity';
import { MediaModule } from '../media/media.module';
import { SharedModule } from 'src/shared/shared.module';
import { AreasModule } from 'src/areas/areas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity]),
    MediaModule,
    SharedModule,
    AreasModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
