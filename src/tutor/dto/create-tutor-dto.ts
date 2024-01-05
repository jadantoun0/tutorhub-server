import { ApiProperty } from '@nestjs/swagger';

// TutorDTO received from the client
export class CreateTutorDTO {
  @ApiProperty({
    description: 'Email of the tutor',
    example: 'tutor@example.com',
  })
  email: string;
  @ApiProperty({
    description: 'Password for the tutor',
    example: 'password123',
  })
  password: string;
  @ApiProperty({ description: 'Role of the tutor', example: 'tutor' })
  role: string;

  constructor(email: string, password: string, role: string) {
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
