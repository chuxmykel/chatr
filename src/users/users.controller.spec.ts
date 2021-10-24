import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserErrors } from './constants';
import { mockUser } from './__fixtures__';
import { mockJWT } from '../auth/__fixtures__';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
        .spyOn(service, 'signUp')
        .mockRejectedValue(new Error(UserErrors.USER_EXISTS));
      try {
        await signUp();
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('should throw an internal server error when unknown errors are encountered', async () => {
      jest
        .spyOn(service, 'signUp')
        .mockRejectedValue(new Error('unknown error'));
      try {
        await signUp();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('should return an access token if signup is successful', async () => {
      const signUpResponse = { access_token: mockJWT };
      jest.spyOn(service, 'signUp').mockResolvedValue(signUpResponse);
      const result = await signUp();
      expect(result).toStrictEqual(signUpResponse);
    });
  });
});
