import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../../admin/token/token.service';
import { RedisService } from 'src/redis/redis.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/isPublic.decorator';
import { ROOT_AUTH_KEY } from '../common/decorators/rootAuth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isRoot = this.reflector.getAllAndOverride<boolean>(ROOT_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('User unauthorized');

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('User unauthorized');
      }

      const userToken = this.tokenService.validateAccessToken(token);

      const tokenInBlackList = await this.redisService.getRedisToken(token);
      if (tokenInBlackList) {
        throw new UnauthorizedException('Token is invalid');
      }

      req.currentUser = userToken;

      return true;
    } catch (e) {
      throw new UnauthorizedException('User unauthorized');
    }
  }
}
