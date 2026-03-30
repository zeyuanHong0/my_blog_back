import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '@/enum/config.enum';

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
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

    return {
      message: '成功',
      data: {
        openid: data.openid,
      },
    };
  }
}
