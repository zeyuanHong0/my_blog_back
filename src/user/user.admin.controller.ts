import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/enum/role.enum';
import { RolesGuard } from '@/auth/guards';

@Controller('admin/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserAdminController {
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

  @Get('list')
  getUserList(
    @Query('name') name: string,
    @Query('pageNum', ParseIntPipe) pageNum: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.userService.getUserList(name, pageNum, pageSize);
  }

  @Post('changeUserStatus')
  changeUserStatus(@Body() data: { id: string; status: 0 | 1 }) {
    return this.userService.changeUserStatus(data.id, data.status);
  }
}
