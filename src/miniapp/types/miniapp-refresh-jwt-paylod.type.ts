import type { MiniappJwtPayload } from './miniapp-jwt-payload.type';

export interface MiniappRefreshJwtPayload extends MiniappJwtPayload {
  type: 'refresh';
}
