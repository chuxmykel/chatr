import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { mockUser } from '../users/__fixtures__/';
import { mockLoginResponse, mockJWT } from './__fixtures__/';

jest.mock('bcrypt', () => ({
  compare: jest.fn((str, hash) => str === hash),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let lastAccessSpy: jest.SpyInstance<Promise<void>, [userId: string]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    lastAccessSpy = jest
      .spyOn(usersService, 'updateLastAccess')
      .mockResolvedValue(undefined);
    jest.spyOn(jwtService, 'sign').mockReturnValue(mockJWT);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if the user with the provided email does not exist', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const result = await service.validateUser(
        mockUser.email,
        mockUser.password,
      );
      expect(result).toBe(null);
    });

    it("should return null if the user's password is wrong", async () => {
      const wrongPassword = 'phoney_pass';
      const result = await service.validateUser(mockUser.email, wrongPassword);
      expect(result).toBe(null);
    });

    it("should return the user's details (without the password) if credentials are valid", async () => {
      const result = await service.validateUser(
        mockUser.email,
        mockUser.password,
      );
      const { password: _, ...expectedResult } = mockUser;
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('login', () => {
    it("should update the user's last access date", async () => {
      await service.login({ email: mockUser.email, id: mockUser.id });
      expect(lastAccessSpy).toHaveBeenCalledTimes(1);
      expect(lastAccessSpy).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return an access token', async () => {
      const result = await service.login({
        email: mockUser.email,
        id: mockUser.id,
      });
      expect(result).toStrictEqual(mockLoginResponse);
    });
  });
});
