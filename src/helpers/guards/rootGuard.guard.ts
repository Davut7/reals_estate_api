import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../../admin/token/token.service';
import { UserService } from '../../admin/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { RoleEnum } from '../constants';

@Injectable()
export class RootGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('User unauthorized');
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('User unauthorized');
      }

      const userToken = this.tokenService.validateAccessToken(token);

      const tokenInBlackList = await this.redisService.getRedisToken(token);
      if (tokenInBlackList) throw new UnauthorizedException('Token is invalid');
      if (userToken.role !== RoleEnum.root)
        throw new ForbiddenException('Permission denied');
      req.currentUser = userToken;
      return true;
    } catch (e) {
      throw new UnauthorizedException('User unauthorized');
    }
  }
}
