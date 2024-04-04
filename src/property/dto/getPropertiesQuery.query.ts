import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { PropertyType, SaleType } from 'src/helpers/constants';

export class GetPropertiesQuery extends PickType(PageOptionsDto, [
  'take',
  'page',
]) {
  @ApiProperty({
    required: false,
    enum: PropertyType,
    description: 'Property type',
    default: undefined,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsOptional()
  @IsString()
  minPrice: string;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsOptional()
  @IsString()
  maxPrice: string;

  @ApiProperty({ required: false, description: 'Number of rooms' })
  @IsOptional()
  @IsString()
  rooms: string;

  @ApiProperty({ required: false, description: 'Number of bathrooms' })
  @IsOptional()
  @IsString()
  baths: string;

  @ApiProperty({
    required: false,
    enum: SaleType,
    description: 'Sale type',
    default: undefined,
  })
  @IsOptional()
  @IsEnum(SaleType)
  saleType: SaleType;

  @ApiProperty({ required: false, description: 'Area' })
  @IsOptional()
  @IsString()
  area: string;
}
