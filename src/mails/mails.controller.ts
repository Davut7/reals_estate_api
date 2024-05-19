import { Body, Controller, Post } from '@nestjs/common';
import { MailsService } from './mails.service';
import { CreateMailDto } from './dto/createMail.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/helpers/common/decorators/isPublic.decorator';

@ApiTags('mails')
@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @ApiResponse({ description: 'Mail sended successfully!' })
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Public()
  @Post()
  sendMail(@Body() dto: CreateMailDto) {
    return this.mailsService.sendMail(dto);
  }
}
