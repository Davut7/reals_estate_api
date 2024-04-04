import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AreaEntity } from 'src/areas/entities/area.entity';
import { PropertyType, SaleType } from 'src/helpers/constants';
import { BaseEntity } from 'src/helpers/entities/baseEntity.entity';
import { MediaEntity } from 'src/media/entities/mediaEntity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'properties' })
export class PropertyEntity extends BaseEntity {
  @ApiProperty({
    name: 'title',
    description: 'Title of the property',
    required: true,
    example: 'Serene Retreat by the Lake',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    name: 'description',
    description: 'Description of the property',
    required: true,
    example: 'Serene Retreat by the Lake',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  description: string;

  @ApiProperty({
    name: 'propertyEnum',
    description: 'Property type of property',
    required: true,
    example: 'house',
    enum: PropertyType,
  })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  @Column({ type: 'enum', enum: PropertyType })
  propertyType: string;

  @ApiProperty({
    name: 'price',
    description: 'Property price',
    required: true,
    example: '120000$',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  price: string;

  @ApiProperty({
    name: 'rooms',
    description: 'Property room',
    required: true,
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  rooms: string;

  @ApiProperty({
    name: 'saleType',
    description: 'Property sale type',
    required: true,
    example: 'rent',
    enum: SaleType,
  })
  @IsEnum(SaleType)
  @IsNotEmpty()
  @Column({ type: 'enum', enum: SaleType })
  saleType: string;

  @ApiProperty({
    name: 'beds',
    description: 'Property beds',
    required: true,
    example: '4 beds',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  beds: string;

  @ApiProperty({
    name: 'baths',
    description: 'Property baths',
    required: true,
    example: '4 baths',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: false })
  baths: string;

  @ApiProperty({ type: 'string', description: 'Area id' })
  @Column({ type: 'uuid', nullable: false })
  areaId: string;

  @ApiProperty({ type: () => AreaEntity })
  @ManyToOne(() => AreaEntity, (area) => area.properties, {
    onDelete: 'CASCADE',
  })
  area: AreaEntity;

  @ApiProperty({ type: () => [MediaEntity] })
  @OneToMany(() => MediaEntity, (media) => media.property)
  medias: MediaEntity[];
}
