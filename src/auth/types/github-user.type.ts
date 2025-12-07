// GitHub /user 接口返回的用户信息
export interface GithubUser {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  name: string;
  email: string | null;
  [key: string]: any;
}

// GitHub /user/emails 接口返回的邮箱信息
export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'public' | 'private' | null;
}
