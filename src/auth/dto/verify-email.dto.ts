import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDTO {
  @ApiProperty({
    description: 'Email address for verification',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email format is invalid' })
  email: string;

  @ApiProperty({
    description: 'One-time password for verification',
    example: '123456',
  })
  @IsNotEmpty({ message: 'DTO is required' })
  otp: string;
}
