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
import { TutorService } from './tutor.service';
import { UpdateTutorDTO } from './dto/update-tutor.dto';
import { Response } from 'express';
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
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateStudentDTOClass } from 'src/student/dto/update-student.dto';

@Controller('tutors')
export class TutorController {
  /**
   * @summary Controller responsible for handling tutor-related operations.
   * @param tutorService - Instance of the TutorService.
   */
  constructor(private readonly tutorService: TutorService) {}

  /**
   * @summary Get all tutors with pagination.
   * @param page - Page number for paginated results (default is 1).
   * @returns Paginated list of tutors.
   * @throws BadRequestException if the page number is not valid.
   * @throws NotFoundException if no data is found on the specified page.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tutors' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'Page number',
    required: false,
  })
  @ApiOkResponse({
    description: 'Paginated list of tutors retrieved successfully.',
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
  async getAllTutors(@Query('page') page: number = 1, @Res() res: Response) {
    try {
      const response = await this.tutorService.getAllTutors(page);
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get all subjects offered by tutors.
   * @returns List of all subjects retrieved successfully.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  @Get('/subjects')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiOkResponse({
    description: 'List of subjects retrieved successfully.',
    type: [String],
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async getAllSubjects(@Res() res: Response) {
    try {
      // calling service to handle business logic
      const serviceResponse = await this.tutorService.getSubjects();
      return res.json(serviceResponse);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get a tutor by ID.
   * @param tutorId - ID of the tutor to retrieve.
   * @returns Tutor details.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  @Get('/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a tutor by ID' })
  @ApiParam({ name: 'id', description: 'Tutor ID' })
  @ApiOkResponse({
    description: 'Tutor details retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Tutor ID.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async getTutor(@Param('id') tutorId: string, @Res() res: Response) {
    if (!tutorId) {
      return new BadRequestException('User not specified');
    }
    try {
      const response = await this.tutorService.getTutor(tutorId);
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Update a tutor by ID.
   * @param tutorId - ID of the tutor to update.
   * @param newTutor - Updated tutor data.
   * @returns Updated tutor details.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a tutor by ID' })
  @ApiParam({ name: 'id', description: 'Tutor ID' })
  @ApiBody({ type: UpdateStudentDTOClass, description: 'Updated tutor data' })
  @ApiOkResponse({
    description: 'Tutor updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Tutor not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async updateTutor(
    @Body() newTutor: UpdateTutorDTO,
    @Param('id') tutorId: string,
    @Res() res: Response,
  ) {
    if (!tutorId) {
      throw new BadRequestException('User not specified');
    }
    try {
      const response = await this.tutorService.updateTutor(tutorId, newTutor);
      res.json(response);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Delete a tutor by ID.
   * @param tutorId - ID of the tutor to delete.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a tutor by ID' })
  @ApiParam({ name: 'id', description: 'Tutor ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tutor deleted successfully',
  })
  @ApiOkResponse({
    description: 'Tutor deleted successfully.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @HttpCode(HttpStatus.NO_CONTENT) // success but no content
  async deleteTutor(@Param('id') tutorId: string) {
    if (!tutorId) {
      return new BadRequestException('User not specified');
    }
    try {
      await this.tutorService.deleteTutor(tutorId);
    } catch (err) {
      throw err;
    }
  }
}
