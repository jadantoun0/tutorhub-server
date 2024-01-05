import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDTO } from './dto/create-course.dto';
import { UpdateCourseDTO } from './dto/update-course-dto';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /**
   * @summary Create a new course
   * @param createCourseDTO - Data for creating a new course
   * @param req - Request object
   * @param res - Response object
   */
  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({
    description: 'Course created successfully.',
  })
  @ApiNotFoundResponse({ description: 'Tutor not found.' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async createCourse(
    @Body() createCourseDTO: CreateCourseDTO,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      const userId = req['userId'];
      const userRole = req['userRole'];
      if (userRole.toLowerCase() !== 'tutor') {
        throw new BadRequestException('You must be a tutor to create a course');
      }
      const response = await this.courseService.createCourse(
        userId,
        createCourseDTO,
      );
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get courses for the user
   * @param req - Request object
   * @returns List of courses for the user
   */
  @Get('/')
  @ApiOperation({ summary: 'Get courses for the user' })
  @ApiResponse({ status: 200, description: 'List of courses for the user' })
  async getCoursesForUser(@Request() req) {
    try {
      const userId = req['userId'];
      const userRole = req['userRole'];
      return await this.courseService.getCoursesForUser(userId, userRole);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get course by ID
   * @param courseId - Course ID
   * @returns Course details retrieved successfully
   */
  @Get(':courseId')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOkResponse({
    description: 'Course retrieved successfully.',
  })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async getCourseById(@Param('courseId') courseId: string) {
    return await this.courseService.getCourseById(courseId);
  }

  /**
   * @summary Update course by ID
   * @param courseId - Course ID
   * @param updatedCourseData - Updated course data
   * @returns Course updated successfully
   */
  @Put(':courseId')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseDTO })
  @ApiOkResponse({
    description: 'Course updated successfully.',
  })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updatedCourseData: UpdateCourseDTO,
  ) {
    return await this.courseService.updateCourse(courseId, updatedCourseData);
  }

  /**
   * @summary Delete course by ID
   * @param courseId - Course ID
   * @returns Course deleted successfully
   */
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Delete(':courseId')
  async deleteCourse(@Param('courseId') courseId: string) {
    return await this.courseService.deleteCourse(courseId);
  }

  /**
   * @summary Add a student to the course
   * @param courseId - Course ID
   * @param studentId - Student ID
   * @returns Student added to the course successfully
   */
  @Post(':courseId/addStudent/:studentId')
  @ApiOperation({ summary: 'Add a student to the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiOkResponse({
    description: 'Student added to the course successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Course or student not found.',
  })
  @ApiBadRequestResponse({
    description: 'Student is already enrolled in the course.',
  })
  async addStudentToCourse(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    return await this.courseService.addStudentToCourse(courseId, studentId);
  }

  /**
   * @summary Remove a student from the course
   * @param courseId - Course ID
   * @param studentId - Student ID
   * @returns Student removed from the course successfully
   */
  @Delete(':courseId/removeStudent/:studentId')
  @ApiOperation({ summary: 'Remove a student from the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiOkResponse({
    description: 'Student removed from the course successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Course, student, or enrollment not found.',
  })
  @ApiBadRequestResponse({
    description: 'Student is not enrolled in the course.',
  })
  async removeStudentFromCourse(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    return await this.courseService.removeStudentFromCourse(
      courseId,
      studentId,
    );
  }

  /**
   * @summary Add a week to the course
   * @param courseId - Course ID
   * @returns Week added to the course successfully
   */
  @Post(':courseId/addWeek')
  @ApiOperation({ summary: 'Add a week to the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOkResponse({
    description: 'Week added to the course successfully.',
  })
  @ApiNotFoundResponse({ description: 'Course not found.' })
  async addWeek(@Param('courseId') courseId: string) {
    return await this.courseService.addWeek(courseId);
  }

  /**
   * @summary Delete a week from the course
   * @param courseId - Course ID
   * @param weekIndex - Week Index
   * @returns Week deleted from the course successfully
   */
  @Delete(':courseId/deleteWeek/:weekIndex')
  @ApiOperation({ summary: 'Delete a week from the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'weekIndex', description: 'Week Index' })
  @ApiOkResponse({
    description: 'Week deleted from the course successfully.',
  })
  @ApiNotFoundResponse({ description: 'Course or invalid week index.' })
  async deleteWeek(
    @Param('courseId') courseId: string,
    @Param('weekIndex') weekIndex: number,
  ) {
    return await this.courseService.deleteWeek(courseId, weekIndex);
  }

  /**
   * @summary Add a file to a week in the course
   * @param courseId - Course ID
   * @param weekIndex - Week Index
   * @param data - File data in string format
   * @returns File added to the week successfully
   */
  @Post(':courseId/addFile/:weekIndex')
  @ApiOperation({ summary: 'Add a file to a week in the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'weekIndex', description: 'Week Index' })
  @ApiBody({ type: String, description: 'File data in string format' })
  @ApiResponse({
    status: 200,
    description: 'File added to the week successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: File should be specified',
  })
  async addFile(
    @Param('courseId') courseId: string,
    @Param('weekIndex') weekIndex: number,
    @Body() data: { file: string },
  ) {
    console.log('received body:', data);

    if (!data?.file) {
      throw new BadRequestException('File should be specified');
    }
    return await this.courseService.addFile(courseId, weekIndex, data.file);
  }

  /**
   * @summary Delete a file from a week in the course
   * @param courseId - Course ID
   * @param weekIndex - Week Index
   * @param fileIndex - File Index
   * @returns File deleted from the week successfully
   */
  @Delete(':courseId/deleteFile/:weekIndex/:fileIndex')
  @ApiOperation({ summary: 'Delete a file from a week in the course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'weekIndex', description: 'Week Index' })
  @ApiParam({ name: 'fileIndex', description: 'File Index' })
  @ApiResponse({
    status: 200,
    description: 'File deleted from the week successfully',
  })
  @ApiResponse({
    status: 200,
    description: 'Week deleted from the course successfully',
  })
  async deleteFile(
    @Param('courseId') courseId: string,
    @Param('weekIndex') weekIndex: number,
    @Param('fileIndex') fileIndex: number,
  ) {
    return await this.courseService.deleteFile(courseId, weekIndex, fileIndex);
  }
}
