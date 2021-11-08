import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { mockUnknownError } from '../test/__fixtures__';
import { mockJWT, mockLoginResponse } from './auth/__fixtures__';
import { mockUser } from './users/__fixtures__';
import { UserErrors } from './users/constants';

describe('AppController', () => {
  let controller: AppController;
  let authService: AuthService;
  let usersService: UsersService;
  const mockRequest = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      controllers: [AppController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login a user and return an access token for subsequent requests', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockRequest);
      expect(result).toBe(mockLoginResponse);
    });
  });

  describe('signUp', () => {
    function signUp() {
      return controller.signUp({
        email: mockUser.email,
        password: mockUser.password,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    }

    it('should not create a new user if a user with the same email exists in the DB', async () => {
      jest
        .spyOn(usersService, 'signUp')
        .mockRejectedValue(new Error(UserErrors.USER_EXISTS));
      try {
        await signUp();
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should throw an internal server error when unknown errors are encountered', async () => {
      jest.spyOn(usersService, 'signUp').mockRejectedValue(mockUnknownError);
      try {
        await signUp();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('should return an access token if signup is successful', async () => {
      const signUpResponse = { access_token: mockJWT };
      jest.spyOn(usersService, 'signUp').mockResolvedValue(signUpResponse);
      const result = await signUp();
      expect(result).toStrictEqual(signUpResponse);
    });
  });
});
