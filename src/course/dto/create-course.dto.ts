import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDTO {
  @ApiProperty({
    description: 'Name of the course',
    example: 'Mathematics 101',
  })
  @IsNotEmpty({ message: 'Course name must be specified' })
  courseName: string;

  @ApiProperty({ description: 'Level of the course', example: 'Beginner' })
  @IsNotEmpty({ message: 'Level must be specified' })
  level: string;

  @ApiProperty({
    description: 'URL of the cover photo (optional)',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  coverPhoto?: string;
}
