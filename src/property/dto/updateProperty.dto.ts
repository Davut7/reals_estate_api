import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './createProperty.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
