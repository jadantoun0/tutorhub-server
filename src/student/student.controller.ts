import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Response } from 'express';
import {
  UpdateStudentDTO,
  UpdateStudentDTOClass,
} from './dto/update-student.dto';
import { Public } from 'src/utils/public.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('students')
export class StudentController {
  /**
   * @summary Controller responsible for handling student-related HTTP requests.
   * @param studentService - Instance of StudentService for interaction with student data.
   */
  constructor(private readonly studentService: StudentService) {}

  /**
   * @summary Get all students.
   * @param page - Page number for paginated results (default is 1).
   * @param res - Express Response object for sending the HTTP response.
   * @returns Promise that resolves to a list of all students.
   * @throws Error if an error occurs during the operation.
   */
  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'Page number',
    required: false,
  })
  @ApiOkResponse({
    description: 'Paginated list of students retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Page number must be a positive integer.',
  })
  @ApiNotFoundResponse({
    description: 'No data found on the specified page.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @Public()
  async getAllStudents(@Query('page') page: number = 1, @Res() res: Response) {
    try {
      const response = await this.studentService.getAllStudents(page);
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get a student by ID.
   * @param studentId - ID of the student to retrieve.
   * @param res - Express Response object for sending the HTTP response.
   * @returns Promise that resolves to the details of the specified student.
   * @throws BadRequestException if the student ID is not specified.
   * @throws Error if an error occurs during the operation.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiOkResponse({
    description: 'Student details retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Student ID.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  async getStudent(@Param('id') studentId: string, @Res() res: Response) {
    if (!studentId) {
      throw new BadRequestException('User not specified');
    }
    try {
      const response = await this.studentService.getStudent(studentId);
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Update a student by ID.
   * @param newStudent - Updated student data from the request body.
   * @param studentId - ID of the student to update.
   * @param res - Express Response object for sending the HTTP response.
   * @returns Promise that resolves to the updated student details.
   * @throws BadRequestException if the student ID is not specified.
   * @throws Error if an error occurs during the operation.
   */
  @Put('/:id')
  @ApiOperation({ summary: 'Update a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDTOClass, description: 'Updated student data' })
  @ApiOkResponse({
    description: 'Student updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Student not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  async updateStudent(
    @Body() newStudent: UpdateStudentDTO,
    @Param('id') studentId: string,
    @Res() res: Response,
  ) {
    if (!studentId) {
      throw new BadRequestException('User not specified');
    }
    try {
      const response = await this.studentService.updateStudent(
        studentId,
        newStudent,
      );
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Delete a student by ID.
   * @param studentId - ID of the student to delete.
   * @throws BadRequestException if the student ID is not specified.
   * @throws Error if an error occurs during the operation.
   */
  @Delete('/:id')
  @Public()
  @ApiOperation({ summary: 'Delete a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiOkResponse({
    description: 'Student deleted successfully.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @HttpCode(HttpStatus.NO_CONTENT) // success but no content
  async deleteStudent(@Param('id') studentId: string) {
    if (!studentId) {
      throw new BadRequestException('User not specified');
    }
    try {
      await this.studentService.deleteStudent(studentId);
    } catch (err) {
      throw err;
    }
  }
}
