import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/userLogin.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RedisService } from 'src/redis/redis.service';
import { AuthGuard } from 'src/helpers/guards/auth.guard';
import { SuccessResponseMessage } from 'src/helpers/common/interfaces/successResponse.interface';
import { AuthResponse } from 'src/helpers/common/interfaces/userAuthResponse.interface';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
  ) {}

  @ApiBody({ type: LoginDto, description: 'Data to login' })
  @ApiCreatedResponse({ type: AuthResponse, description: 'User logged in' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.authService.loginUser(loginDto);
    res.cookie('refreshToken', user.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({
      message: 'System user login successfully!',
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({ type: AuthResponse, description: 'User tokens refreshed' })
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
      user: user.user,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  }

  @ApiOkResponse({
    description: 'User logged out',
    type: SuccessResponseMessage,
  })
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = req.headers.authorization.split(' ')[1];
    console.log(accessToken);
    await this.redisService.setTokenWithExpiry(accessToken, accessToken);
    await this.authService.logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'Log out successfully!',
    });
  }
}
