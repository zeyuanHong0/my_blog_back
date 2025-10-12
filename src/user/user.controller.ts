import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('addUser')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('getUserInfo/:id')
  getUserInfoById(@Param('id') id: string) {
    return this.userService.getUserInfoById(id);
  }

  @Delete('deleteUser/:id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
