import { Role } from '@/enum/role.enum';

// 写入 JWT token 的 payload（只有 id 和 username）
export interface JwtTokenPayload {
  id: string;
  username: string;
}

// validate 后挂到 request.user 的完整对象
export interface JwtPayload extends JwtTokenPayload {
  accountType: Role;
}
