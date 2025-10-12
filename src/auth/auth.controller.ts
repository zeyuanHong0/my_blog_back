import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/login')
  login() {
    // Implement login logic here
    return { message: 'Login successful' };
  }

  @Post('user/register')
  register() {
    // Implement registration logic here
    return { message: 'Registration successful' };
  }
}
