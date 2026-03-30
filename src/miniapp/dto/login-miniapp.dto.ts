import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMiniappDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
