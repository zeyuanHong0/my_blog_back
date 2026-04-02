import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigEnum } from '@/enum/config.enum';
import { WxUser } from './entities/wx-user.entity';

@Injectable()
export class MiniappRefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'miniapp-refresh-jwt',
) {
  constructor(
    @InjectRepository(WxUser)
    private readonly wxUserRepository: Repository<WxUser>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ConfigEnum.JWT_SECRET),
    });
  }

  async validate(payload: {
    id: string;
    openid: string;
    loginType: string;
    type: string;
  }) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('无效的token类型');
    }

    const wxUser = await this.wxUserRepository.findOne({
      where: { id: payload.id, openid: payload.openid, is_delete: 0 },
    });

    if (!wxUser) {
      throw new UnauthorizedException('小程序用户不存在');
    }

    return wxUser;
  }
}
