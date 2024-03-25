import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenService } from '../token/token.service';
import { TokenDto } from '../token/dto/token.dto';
import { LoginDto } from './dto/userLogin.dto';
import { compare } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tokenService: TokenService,
  ) {}

  async loginUser(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { name: dto.name },
    });
    if (!user) throw new NotFoundException(`User with ${dto.name} not found!`);

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new BadRequestException(`User password incorrect!`);

    const tokens = this.tokenService.generateTokens({ ...new TokenDto(user) });

    await this.tokenService.saveTokens(user.id, tokens.refreshToken);

    return {
      message: 'User login successful!',
      user: user,
      ...tokens,
    };
  }

  async logoutUser(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException();
    await this.tokenService.deleteToken(refreshToken);
    return {
      message: 'User logged out!',
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException();
    const tokenFromDB = await this.tokenService.findToken(refreshToken);
    const validToken = this.tokenService.validateRefreshToken(refreshToken);
    if (!validToken && !tokenFromDB) throw new UnauthorizedException();
    const user = await this.userRepository.findOne({
      where: { id: validToken.id },
    });
    const tokens = this.tokenService.generateTokens({ ...new TokenDto(user) });
    await this.tokenService.saveTokens(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: new TokenDto(user),
    };
  }
}
