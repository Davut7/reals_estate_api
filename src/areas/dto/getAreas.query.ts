import { PickType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';

export class GetAreasQuery extends PickType(PageOptionsDto, ['page', 'take']) {}
