import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password?: string;
}

