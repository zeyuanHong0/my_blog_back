import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@/auth/types/jwt-payload.type';
import { MiniappJwtPayload } from '@/miniapp/types/miniapp-jwt-payload.type';
import { MiniappRefreshJwtPayload } from '@/miniapp/types/miniapp-refresh-jwt-paylod.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return req.user;
  },
);

export const CurrentWxUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): MiniappJwtPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: MiniappJwtPayload }>();
    return req.user;
  },
);

export const CurrentRefreshWxUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): MiniappRefreshJwtPayload => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ user: MiniappRefreshJwtPayload }>();
    return req.user;
  },
);
