import { IsEmail, IsIn, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/utils/types';

export class CreateTempUserDTO {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'SecurePassword123',
  })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message: `Password must include:
          At least 6 characters 
          At least one uppercase letter
          At least one lowercase letter 
          At least one number
        `,
    },
  )
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role of the user (either "tutor" or "student")',
    example: 'tutor',
  })
  @IsIn(['tutor', 'student'], { message: "Role must be 'tutor' or 'student'" })
  role: UserRole;

  constructor(email: string, hashedPassword: string, role: UserRole) {
    this.email = email;
    this.password = hashedPassword;
    this.role = role;
  }
}
