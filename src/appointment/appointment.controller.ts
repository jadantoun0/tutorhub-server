import {
  Body,
  Controller,
  Request,
  Post,
  Res,
  Get,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { RequestAppointmentDTO } from './dto/request-appointment.dto';
import { Response } from 'express';
import { UpdateAppointmentDTO } from './dto/update-appointment.dto';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request an appointment' })
  @ApiCreatedResponse({
    description: 'Appointment requested successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User not found or an unknown server error occurred.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async requestAppointment(
    @Request() req,
    @Body() appointment: RequestAppointmentDTO,
    @Res() res: Response,
  ) {
    try {
      const studentId = req.userId; // retrieving value added by auth middleware
      const createdAppointment =
        await this.appointmentService.requestAppointment(
          studentId,
          appointment,
        );
      res.json(createdAppointment);
    } catch (err) {
      throw err;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get appointments for the user' })
  @ApiOkResponse({
    description: 'User appointments retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User not found or an unknown server error occurred.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async getAppointmentsForUser(@Request() req, @Res() res: Response) {
    try {
      const { userId, userRole } = req; // retrieving valu added by auth middleware
      const appointments = await this.appointmentService.getUserAppointments(
        userId,
        userRole,
      );
      res.json(appointments);
    } catch (err) {
      throw err;
    }
  }

  @Get('/pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending appointments for the user' })
  @ApiOkResponse({
    description: 'Pending appointments retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async getPendingAppointments(@Request() req, @Res() res: Response) {
    try {
      const { userId, userRole } = req; // retrieving valu added by auth middleware
      const appointments = await this.appointmentService.getPendingAppointments(
        userId,
        userRole,
      );
      res.json(appointments);
    } catch (err) {
      throw err;
    }
  }

  @Put('/accept/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiOkResponse({
    description: 'Appointment accepted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found or an unknown server error occurred.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async acceptAppointment(
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    try {
      const appointment =
        await this.appointmentService.acceptAppointment(appointmentId);
      res.json(appointment);
    } catch (err) {
      throw err;
    }
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiOkResponse({
    description: 'Appointment updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found or an unknown server error occurred.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async updateAppointment(
    @Param('id') appointmentId: string,
    @Body() appointmentData: UpdateAppointmentDTO,
    @Res() res: Response,
  ) {
    try {
      const appointment = await this.appointmentService.updateAppointment(
        appointmentId,
        appointmentData,
      );
      res.json(appointment);
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found or an unknown server error occurred.',
  })
  async deleteAppointment(@Param('id') appointmentId: string) {
    try {
      await this.appointmentService.deleteAppointment(appointmentId);
    } catch (err) {
      throw err;
    }
  }
}
