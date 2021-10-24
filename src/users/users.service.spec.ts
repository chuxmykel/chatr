import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { FindConditions, FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { mockUser } from './__fixtures__';
import { UserErrors } from './constants';
import { mockJWT } from '../auth/__fixtures__';
import { CreateUserDto } from './dto/create-user.dto';
import { mockDate } from '../../test/__fixtures__';

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let authService: AuthService;
  let repo: Repository<User>;
  let findSpy: jest.SpyInstance<
    Promise<User>,
    [conditions?: FindConditions<User>, options?: FindOneOptions<User>]
  >;
  let saveSpy;
  const createUserDto: CreateUserDto = {
    email: mockUser.email,
    password: mockUser.password,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        UsersService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    findSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(mockUser);
    saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(mockUser);

    jwtService.sign = jest.fn(() => mockJWT);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw an error if a user with the email exists already', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      try {
        await service.signUp(createUserDto);
      } catch (error) {
        expect(error.message).toBe(UserErrors.USER_EXISTS);
      }
    });

    it('should sign up a user successfully', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      const updateLastAccessSpy = jest
        .spyOn(service, 'updateLastAccess')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockUser);
      const loginSpy = jest.spyOn(authService, 'login');
      const result = await service.signUp(createUserDto);

      expect(result).toStrictEqual({ access_token: mockJWT });
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(updateLastAccessSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(createUserDto);
      expect(loginSpy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createSpy = jest.spyOn(repo, 'create').mockReturnValue(mockUser);
      const result = await service.create(createUserDto);

      expect(result).toBe(mockUser);
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(createUserDto);
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should find the user with the specified id', async () => {
      const result = await service.findOne(mockUser.id);
      expect(result).toBe(mockUser);
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findByEmail', () => {
    it('should find the user with the specified email', async () => {
      const result = await service.findByEmail(mockUser.email);
      expect(result).toBe(mockUser);
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith({ email: mockUser.email });
    });
  });

  describe('updateLastAccess', () => {
    it("should update the user's last access", async () => {
      await service.updateLastAccess(mockUser.id);
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(mockUser);
    });
  });
});
