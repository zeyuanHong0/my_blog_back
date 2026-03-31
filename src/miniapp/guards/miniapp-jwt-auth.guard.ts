import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MiniappJwtAuthGuard extends AuthGuard('miniapp-jwt') {}
