import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty()
  access_token: string;
}

export class ExceptionDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}
