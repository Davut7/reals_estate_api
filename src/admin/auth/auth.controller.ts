import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/userLogin.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RedisService } from 'src/redis/redis.service';
import { Public } from 'src/helpers/common/decorators/isPublic.decorator';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
  ) {}

  @ApiCreatedResponse({
    description: 'User logged in',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        firstName: { type: 'string' },
        role: { type: 'string' },
        message: { type: 'string', example: 'System user login successfully!' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'User password incorrect!',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'User with not found!',
  })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.authService.loginUser(loginDto);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'System user login successfully!',
      id: user.id,
      firstName: user.firstName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiCreatedResponse({
    description: 'User tokens refreshed in',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        firstName: { type: 'string' },
        role: { type: 'string' },
        message: {
          type: 'string',
          example: 'System user tokens refreshed successfully!',
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: 'User unauthorized',
  })
  @Public()
  @Get('refresh')
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const user = await this.authService.refreshToken(refreshToken);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'System user tokens refreshed successfully!',
      id: user.id,
      firstName: user.firstName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({
    description: 'User logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Log out successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: 'User unauthorized',
  })
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = req.headers.authorization.split(' ')[1];
    await this.redisService.setTokenWithExpiry(accessToken, accessToken);
    await this.authService.logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'Log out successfully!',
    });
  }
}
