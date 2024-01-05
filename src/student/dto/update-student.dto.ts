export interface UpdateStudentDTO {
  firstName?: string;
  email?: string;
  password?: string;
  profilePic?: string;
  bio?: string;
  nationality?: string;
  languages?: string;
  educationalLevel?: string;
  dateOfBirth?: Date;
}

import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDTOClass implements UpdateStudentDTO {
  @ApiProperty({ description: 'First name of the student', example: 'John' })
  firstName?: string;

  @ApiProperty({
    description: 'Email address of the student',
    example: 'john@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Password for the student',
    example: 'securepassword',
  })
  password?: string;

  @ApiProperty({
    description: "URL of the student's profile picture",
    example: 'https://example.com/profile.jpg',
  })
  profilePic?: string;

  @ApiProperty({
    description: 'Biography of the student',
    example: 'A passionate learner',
  })
  bio?: string;

  @ApiProperty({ description: 'Nationality of the student', example: 'US' })
  nationality?: string;

  @ApiProperty({
    description: 'Languages spoken by the student',
    example: 'English, Spanish',
  })
  languages?: string;

  @ApiProperty({
    description: 'Educational level of the student',
    example: "Bachelor's Degree",
  })
  educationalLevel?: string;

  @ApiProperty({
    description: 'Date of birth of the student',
    example: '1990-01-01',
  })
  dateOfBirth?: Date;
}
