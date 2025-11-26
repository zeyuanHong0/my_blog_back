import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { ConfigEnum } from '@/enum/config.enum';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 优先从 cookie 中提取
        (request: Request) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const token = request?.cookies?.token as string | undefined;
          return token ?? null;
        },
        // 兼容从 Authorization header 中提取
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>(ConfigEnum.JWT_SECRET) || 'default_secret',
    });
  }

  validate(payload: JwtPayload) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('无效的 token');
    }
    return { id: payload.id, username: payload.username };
  }
}
