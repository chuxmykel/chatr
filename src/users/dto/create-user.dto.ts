import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail({}, { message: 'invalid email.'})
  email: string;

  @IsString()
  @MaxLength(20)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
    { message: 'password too weak.' },
  )
  password: string;
}
