import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SessionType } from 'src/utils/types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDTO {
  @ApiProperty({
    description: 'Date of the appointment',
    example: '2023-12-31T12:00:00Z',
    required: false,
  })
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'Name of the course',
    example: 'Math 102',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiProperty({
    description: 'Type of session',
    enum: ['in-person', 'remote'],
    example: 'remote',
    required: false,
  })
  @IsOptional()
  type?: SessionType;

  @ApiProperty({
    description: 'Duration of the appointment in minutes',
    example: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
