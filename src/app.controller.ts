import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UserErrors } from './users/constants';
import { CreateUserDto } from './users/dto/create-user.dto';
import { ExceptionDto, SignUpResponseDto } from './users/response/sign-up-response.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @ApiCreatedResponse({
    description: 'User Registration Successful.',
    type: SignUpResponseDto,
  })
  @ApiConflictResponse({
    description:
      'User registration failed as a user with the email already exists.',
    type: ExceptionDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ExceptionDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ExceptionDto,
  })
  @ApiTags('auth')
  @Post('auth/register')
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SignUpResponseDto> {
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

  @ApiTags('auth')
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
