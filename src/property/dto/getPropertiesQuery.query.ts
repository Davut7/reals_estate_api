import { PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { PropertyType, SaleType } from 'src/helpers/constants';

export class GetPropertiesQuery extends PickType(PageOptionsDto, [
  'take',
  'page',
]) {
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsOptional()
  @IsString()
  minPrice: string;

  @IsOptional()
  @IsString()
  maxPrice: string;

  @IsOptional()
  @IsString()
  rooms: string;

  @IsOptional()
  @IsString()
  baths: string;

  @IsOptional()
  @IsEnum(SaleType)
  saleType: SaleType;

  @IsOptional()
  @IsString()
  area: string;
}
