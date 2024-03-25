import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/entities/baseEntity.entity';
import { MediaEntity } from 'src/media/entities/mediaEntity';
import { PropertyEntity } from 'src/property/entities/property.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'areas' })
export class AreaEntity extends BaseEntity {
  @ApiProperty({ title: 'title', name: 'title', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    title: 'description',
    name: 'description',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false })
  description: string;

  @OneToMany(() => PropertyEntity, (properties) => properties.area)
  properties: PropertyEntity[];

  @OneToMany(() => MediaEntity, (media) => media.area)
  medias: MediaEntity[];
}
