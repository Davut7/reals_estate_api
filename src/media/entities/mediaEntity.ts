import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne } from 'typeorm';
import { AreaEntity } from 'src/areas/entities/area.entity';
import { BaseEntity } from 'src/helpers/entities/baseEntity.entity';
import { PropertyEntity } from 'src/property/entities/property.entity';

@Entity({ name: 'medias' })
export class MediaEntity extends BaseEntity {
  @ApiProperty({ description: 'File name', example: 'example.jpg' })
  @Column({ nullable: false })
  fileName: string;

  @ApiProperty({
    description: 'File path',
    example: '/path/to/file/example.jpg',
  })
  @Column({ nullable: false })
  filePath: string;

  @ApiProperty({ description: 'MIME type of the file', example: 'image/jpeg' })
  @Column({ nullable: false })
  mimeType: string;

  @ApiProperty({ description: 'Size of the file in bytes', example: '1024' })
  @Column({ nullable: false })
  size: string;

  @ApiProperty({
    description: 'Original name of the file',
    example: 'example.jpg',
  })
  @Column({ nullable: false })
  originalName: string;

  @ApiProperty({
    description: 'ID of the associated area',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', nullable: true })
  areaId: string;

  @ApiProperty({
    description: 'ID of the associated property',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ApiProperty({ type: () => AreaEntity })
  @ManyToOne(() => AreaEntity, (area) => area.medias, { onDelete: 'CASCADE' })
  area: AreaEntity;

  @ApiProperty({ type: () => PropertyEntity })
  @ManyToOne(() => PropertyEntity, (property) => property.medias, {
    onDelete: 'CASCADE',
  })
  property: PropertyEntity;
}
