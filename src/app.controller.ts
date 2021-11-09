import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  ConflictException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiOkResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UserErrors } from './users/constants';
import { CreateUserDto } from './users/dto/create-user.dto';
import { ExceptionDto } from './exception-response.dto';
import { AuthResponseDto } from './auth-response.dto';
import { LoginUserDto} from './login-user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @ApiCreatedResponse({
    description: 'User Registration Successful.',
    type: AuthResponseDto,
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
  ): Promise<AuthResponseDto> {
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

  @ApiOkResponse({
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ExceptionDto
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ExceptionDto,
  })
  @ApiTags('auth')
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @HttpCode(200)
  async login(@Request() req: any) { // TODO: fix Request type with auth user later.
    return await this.authService.login(req.user);
  }
}
