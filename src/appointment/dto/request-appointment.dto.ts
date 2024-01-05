import { IsIn, IsNotEmpty } from 'class-validator';
import { SessionType } from 'src/utils/types';
import { ApiProperty } from '@nestjs/swagger';

export class RequestAppointmentDTO {
  @ApiProperty({ description: 'Name of the course', example: 'Math 101' })
  @IsNotEmpty({ message: 'Course name must be specified' })
  courseName: string;

  @ApiProperty({
    description: 'Type of session',
    enum: ['in-person', 'remote'],
    example: 'in-person',
  })
  @IsIn(['in-person', 'remote'], {
    message: "Type must be either 'in-person' or 'remote'",
  })
  type: SessionType;

  @ApiProperty({
    description: 'Duration of the appointment in minutes',
    example: 60,
  })
  @IsNotEmpty({ message: 'Duration must be specified' })
  duration: number;

  @ApiProperty({ description: 'ID of the tutor', example: '123' })
  @IsNotEmpty({ message: 'Tutor must be specified' })
  tutorId: string;

  @ApiProperty({
    description: 'Date of the appointment',
    example: '2023-12-31T12:00:00Z',
  })
  @IsNotEmpty({ message: 'Date must be specified' })
  date: Date;
}
