import { mockDate } from '../../../test/__fixtures__';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export const mockUser: User = Object.assign(new User(), {
  id: '1',
  firstName: 'Test',
  lastName: 'Test',
  email: 'test@test.com',
  password: 'P@ssword123',
  isVerified: false,
  lastAccess: mockDate,
  created_at: mockDate,
  updated_at: mockDate,
});

export const mockCreateUserDto: CreateUserDto = {
  email: mockUser.email,
  password: mockUser.password,
  firstName: mockUser.firstName,
  lastName: mockUser.lastName,
};
