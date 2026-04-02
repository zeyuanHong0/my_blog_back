import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ConfigEnum } from '@/enum/config.enum';
import { WxUser } from './entities/wx-user.entity';

type WxLoginSuccess = {
  openid: string;
  session_key: string;
  unionid?: string;
};

type WxLoginError = {
  errcode: number;
  errmsg: string;
};

type WxLoginResponse = WxLoginSuccess | WxLoginError;

@Injectable()
export class MiniappService {
  constructor(
    @InjectRepository(WxUser)
    private readonly wxUserRepository: Repository<WxUser>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  // 微信登录
  async wxLogin(code: string) {
    const wx_appid = this.configService.get<string>(ConfigEnum.MINIAPP_APPID);
    const wx_secret = this.configService.get<string>(ConfigEnum.MINIAPP_SECRET);

    const { data } = await firstValueFrom(
      this.httpService.get<WxLoginResponse>(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          params: {
            appid: wx_appid,
            secret: wx_secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      ),
    );

    if ('errcode' in data) {
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    const openid = data.openid;
    let wxUser = await this.wxUserRepository.findOne({
      where: { openid: openid, is_delete: 0 },
    });
    if (!wxUser) {
      wxUser = await this.wxUserRepository.save({
        openid,
      });
    }
    // access_token
    const access_token = this.jwtService.sign({
      id: wxUser.id,
      openid: wxUser.openid,
      loginType: 'miniapp',
    });
    // refresh_token
    const refresh_token = this.jwtService.sign(
      {
        id: wxUser.id,
        openid: wxUser.openid,
        loginType: 'miniapp',
        type: 'refresh',
      },
      { expiresIn: '30d' },
    );
    return {
      message: '成功',
      data: {
        access_token,
        refresh_token,
      },
    };
  }

  async refresh(id: string) {
    const wxUser = await this.wxUserRepository.findOne({
      where: { id, is_delete: 0 },
    });
    if (!wxUser) {
      throw new UnauthorizedException('用户不存在');
    }
    const access_token = this.jwtService.sign({
      id: wxUser.id,
      openid: wxUser.openid,
      loginType: 'miniapp',
    });
    return {
      data: {
        access_token,
      },
    };
  }

  // 判断用户是不是 admin
  isUserAdmin(openid: string) {
    const adminOpenid = this.configService.get<string>(
      ConfigEnum.MINIAPP_OWNER_OPENID,
    );
    return {
      data: {
        isAdmin: openid === adminOpenid,
      },
    };
  }
}
