import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Email address for OTP resend',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email format is invalid' })
  email: string;
}
