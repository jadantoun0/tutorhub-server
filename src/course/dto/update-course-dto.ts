import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDTO {
  @ApiProperty({
    description: 'Updated name of the course',
    example: 'Advanced Mathematics',
  })
  @IsOptional()
  courseName?: string;

  @ApiProperty({
    description: 'Updated level of the course',
    example: 'Intermediate',
  })
  @IsOptional()
  level?: string;

  @ApiProperty({
    description: 'Updated URL of the cover photo',
    example: 'https://example.com/new-cover.jpg',
  })
  @IsOptional()
  coverPhoto?: string;
}
