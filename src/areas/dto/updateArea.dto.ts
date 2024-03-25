import { CreateAreaDto } from './createArea.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
