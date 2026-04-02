import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { MiniappRefreshJwtPayload } from '@/miniapp/types/miniapp-refresh-jwt-paylod.type';

@Injectable()
export class MiniappRefreshJwtAuthGuard extends AuthGuard(
  'miniapp-refresh-jwt',
) {
  handleRequest<TUser = MiniappRefreshJwtPayload>(
    err: any,
    user: TUser,
    info: any,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw new HttpException(
        { code: 401003, message: 'refresh_token已过期，重新登录' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (info instanceof JsonWebTokenError) {
      throw new HttpException(
        { code: 401004, message: 'refresh_token无效，重新登录' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
