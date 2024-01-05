import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDTO {
  @ApiProperty({
    description: 'Email address for sign-in',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email format is invalid' })
  email: string;

  @ApiProperty({ description: 'Password for sign-in', example: 'password123' })
  @IsNotEmpty({ message: 'Password must be specified' })
  password: string;
}
