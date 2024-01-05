import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor } from './tutor.model';
import { UpdateTutorDTO } from './dto/update-tutor.dto';
import { TutorDTO } from './dto/tutor-dto';
import { CreateTutorDTO } from './dto/create-tutor-dto';
import { Model } from 'mongoose';

@Injectable()
export class TutorService {
  /**
   * @summary Service responsible for handling tutor-related business logic.
   * @param tutorModel - Instance of the Tutor model.
   */
  constructor(
    @InjectModel('Tutor') private readonly tutorModel: Model<Tutor>,
  ) {}

  /**
   * @summary Get all tutors with pagination.
   * @param page - Page number for paginated results (default is 1).
   * @returns Paginated list of tutors.
   * @throws BadRequestException if the page number is not valid.
   * @throws NotFoundException if no data is found on the specified page.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getAllTutors(
    page: number,
  ): Promise<{ data: TutorDTO[]; totalPages: number }> {
    try {
      const recordsPerPage = 5; // 10 tutors per page

      if (page < 1) {
        throw new BadRequestException('Page number must be a positive integer');
      }

      const skipNumber = (page - 1) * recordsPerPage;
      const tutors = await this.tutorModel
        .find()
        .select('-password')
        .skip(skipNumber)
        .limit(recordsPerPage);

      if (tutors.length === 0) {
        throw new NotFoundException('No data found on the specified page');
      }

      // to keep the client side informed of the total number of pages
      const totalCount = await this.tutorModel.countDocuments();
      const totalPages = Math.ceil(totalCount / recordsPerPage);

      return { data: tutors, totalPages };
    } catch (err) {
      console.log(err);
      // if its catching an error we threw previously, we return it as it is
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      // else, we return an internal server error
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Get a tutor by ID.
   * @param tutorId - ID of the tutor to retrieve.
   * @returns Tutor details.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getTutor(tutorId: string): Promise<TutorDTO> {
    try {
      const tutor = await this.tutorModel.findById(tutorId).select('-password');
      // if id is incorrect, it will fail to convert string to id, an exception is thrown
      if (!tutor) {
        throw new BadRequestException('Invalid Tutor ID');
      }
      return tutor;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Update a tutor by ID.
   * @param tutorId - ID of the tutor to update.
   * @param newTutor - Updated tutor data.
   * @returns Updated tutor details.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws NotFoundException if the tutor is not found.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async updateTutor(
    tutorId: string,
    newTutor: UpdateTutorDTO,
  ): Promise<TutorDTO> {
    try {
      const updatedTutor = await this.tutorModel
        .findByIdAndUpdate(tutorId, newTutor, { new: true }) // new parameter to return the updated document
        .select('-password'); // removing id and password since they should not be sent to the client
      // tutor was not found
      if (!updatedTutor) {
        throw new NotFoundException('Tutor Not Found');
      }
      // success
      return updatedTutor;
    } catch (err) {
      console.log(err);
      // if its catching an error we threw previously, we throw it as it is to maintain err msg
      if (err instanceof NotFoundException) {
        throw err;
      }
      // else, we return an internal server error
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Get all subjects offered by tutors.
   * @returns List of all subjects retrieved successfully.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getSubjects(): Promise<string[]> {
    try {
      const subjects = await this.tutorModel.distinct('subject');
      return subjects;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An unknown server error occured.',
      );
    }
  }

  /**
   * @summary Delete a tutor by ID.
   * @param tutorId - ID of the tutor to delete.
   * @throws BadRequestException if the tutor ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async deleteTutor(tutorId: string): Promise<void> {
    try {
      await this.tutorModel.findByIdAndDelete(tutorId);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An unknown server error occured.',
      );
    }
  }

  /** Not exposed by a controller, but to be used by other services like auth */
  /**
   * @summary Check if an email exists for a tutor.
   * @param email - Email to check.
   * @returns True if the email exists, false otherwise.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const exists = await this.tutorModel.exists({ email });
      return !!exists; // converting to boolean
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Get a tutor by email.
   * @param email - Email of the tutor to retrieve.
   * @returns Tutor details.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getTutorByEmail(email: string): Promise<Tutor> {
    try {
      const tutor = await this.tutorModel.findOne({ email });
      return tutor;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  // this method is invoked by another service (auth), not exposed to a controller.
  // so there is no need to make validations, tutor will be created after temp user
  // was created, and all validations were made.
  /**
   * @summary Create a new tutor.
   * @param tutor - Tutor data to create.
   * @returns Created tutor details.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async createTutor(tutor: CreateTutorDTO): Promise<TutorDTO> {
    try {
      // create tutor
      const createdTutor = await this.tutorModel.create(tutor);
      // omitting sensitive information (_id and password) before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...createdTutorWithoutSensitiveInfo } =
        createdTutor.toObject();
      // returning the created tutor without sensitive information
      return createdTutorWithoutSensitiveInfo;
    } catch (err) {
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Add an appointment ID to a tutor's appointments.
   * @param tutorId - ID of the tutor.
   * @param appointmentId - ID of the appointment.
   * @throws NotFoundException if the tutor is not found.
   */
  async addAppointment(tutorId: string, appointmentId: string) {
    try {
      await this.tutorModel.findByIdAndUpdate(tutorId, {
        $push: { appointments: appointmentId },
      });
    } catch (err) {
      console.log(err);
      throw new NotFoundException('Tutor not found');
    }
  }

  /**
   * @summary Find a tutor by ID.
   * @param id - ID of the tutor.
   * @returns Tutor details.
   */
  async findById(id: string) {
    return this.tutorModel.findById(id);
  }
}
