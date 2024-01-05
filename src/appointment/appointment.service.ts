import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RequestAppointmentDTO } from './dto/request-appointment.dto';
import { Appointment } from './appointment.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TutorService } from 'src/tutor/tutor.service';
import { StudentService } from 'src/student/student.service';
import { UpdateAppointmentDTO } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
    private readonly tutorService: TutorService,
    private readonly studentService: StudentService,
  ) {}

  async requestAppointment(
    studentId: string,
    appointment: RequestAppointmentDTO,
  ): Promise<Appointment> {
    const { tutorId, duration, date, courseName, type } = appointment;

    try {
      // info is complete
      const newAppointment = new this.appointmentModel({
        student: studentId,
        tutor: tutorId,
        date,
        duration,
        courseName,
        type,
      });
      // saving appointment in appointments collection
      const createdAppointment = await newAppointment.save();

      // updating tutors and students to reference the new created appointment
      await this.tutorService.addAppointment(
        tutorId,
        `${createdAppointment._id}`,
      );
      await this.studentService.addAppointment(
        studentId,
        `${createdAppointment._id}`,
      );

      return createdAppointment;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  async getUserAppointments(
    userId: string,
    userRole: string,
  ): Promise<Appointment[]> {
    try {
      // if the user requesting is a tutor
      if (userRole.toLowerCase() === 'tutor') {
        // retrieve the tutor object
        const user = await this.tutorService.getTutor(userId);

        // if the user is not found in the db
        if (!user) {
          throw new NotFoundException('User not found');
        }

        // retrieving the user's appointments and sending them to the client
        const appointments = await this.appointmentModel
          .find({
            tutor: userId,
            status: { $ne: 'pending' },
          })
          .sort({ date: 1 })
          .populate('student');

        return appointments;
      }

      // if the user requesting is a student
      else if (userRole.toLowerCase() === 'student') {
        // retrieve the student object
        const user = await this.studentService.getStudent(userId);

        // if the user is not found in the db
        if (!user) {
          throw new NotFoundException('User not found');
        }

        // retrieving the user's appointments and sending them to the client
        const appointments = await this.appointmentModel
          .find({
            student: userId,
            status: { $ne: 'pending' },
          })
          .sort({ date: 1 })
          .populate('tutor');

        return appointments;
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  async getPendingAppointments(
    userId: string,
    userRole: string,
  ): Promise<Appointment[]> {
    try {
      let appointments: Appointment[];
      if (userRole.toLowerCase() === 'tutor') {
        appointments = await this.appointmentModel
          .find({
            tutor: userId,
            status: 'pending',
          })
          .populate('student');
      } else if (userRole.toLowerCase() === 'student') {
        appointments = await this.appointmentModel
          .find({
            student: userId,
            status: 'pending',
          })
          .populate('tutor');
      }
      return appointments;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  async updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentDTO,
  ): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.exists({
        _id: appointmentId,
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { ...updateData },
        { new: true },
      );
      return updatedAppointment;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  async acceptAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.exists({
        _id: appointmentId,
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found!');
      }
      const updatedAppointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: 'confirmed' },
        { new: true },
      );
      return updatedAppointment;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  async deleteAppointment(appointmentId: string) {
    try {
      const appointment = await this.appointmentModel.exists({
        _id: appointmentId,
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      await this.appointmentModel.findByIdAndDelete(appointmentId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }
}
