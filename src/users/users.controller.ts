import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

import { UserErrors } from './constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    try {
      const result = await this.usersService.signUp(createUserDto);
      return result;
    } catch (error) {
      switch (error.message) {
        case UserErrors.USER_EXISTS:
          throw new ConflictException();
        default:
          throw new InternalServerErrorException();
      }
    }
  }
}
