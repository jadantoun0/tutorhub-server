import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './student.model';
import { UpdateStudentDTO } from './dto/update-student.dto';
import { StudentDTO } from './dto/student-dto';
import { CreateStudentDTO } from './dto/create-student-dto';

@Injectable()
export class StudentService {
  // injecting student model
  /**
   * @summary Service responsible for handling student-related operations.
   * @param studentModel - Mongoose model for the Student entity.
   */
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<Student>,
  ) {}

  // function to get all students from the database (with pagination)
  /**
   * @summary Get all students with pagination.
   * @param page - Page number for paginated results (default is 1).
   * @returns Promise that resolves to a paginated list of students.
   * @throws BadRequestException if the page number is not valid.
   * @throws NotFoundException if no data is found on the specified page.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getAllStudents(
    page: number,
  ): Promise<{ data: StudentDTO[]; totalPages: number }> {
    try {
      const recordsPerPage = 10; // 10 students per page

      if (page < 1) {
        throw new BadRequestException('Page number must be a positive integer');
      }

      // number of documents to skip before starting retrieval
      const skipNumber = (page - 1) * recordsPerPage;
      const students = await this.studentModel
        .find()
        .select('-password')
        .skip(skipNumber)
        .limit(recordsPerPage);

      if (students.length === 0) {
        throw new NotFoundException('No data found on the specified page');
      }

      // to keep the client side informed of the total number of pages
      const totalCount = await this.studentModel.countDocuments();
      const totalPages = Math.ceil(totalCount / recordsPerPage);

      return { data: students, totalPages };
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

  // function to retrieve student by id from the database
  /**
   * @summary Get a student by ID.
   * @param studentId - ID of the student to retrieve.
   * @returns Promise that resolves to the details of the specified student.
   * @throws BadRequestException if the student ID is not valid.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getStudent(studentId: string): Promise<StudentDTO> {
    const student = await this.studentModel
      .findById(studentId)
      .select('-password');

    if (!student) {
      throw new BadRequestException('Invalid Student ID');
    }
    return student;
  }

  /**
   * @summary Update a student by ID.
   * @param studentId - ID of the student to update.
   * @param newStudent - Updated student data.
   * @returns Promise that resolves to the updated student details.
   * @throws NotFoundException if the student is not found.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async updateStudent(
    studentId: string,
    newStudent: UpdateStudentDTO,
  ): Promise<StudentDTO> {
    try {
      const updatedStudent = await this.studentModel
        .findByIdAndUpdate(studentId, newStudent, { new: true }) // new parameter to return the updated document
        .select('-password'); // removing id and password since they should not be sent to the client
      // student was not found
      if (!updatedStudent) {
        throw new NotFoundException('Student Not Found');
      }
      // success
      return updatedStudent;
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
   * @summary Delete a student by ID.
   * @param studentId - ID of the student to delete.
   * @returns Promise that resolves once the student is deleted.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      await this.studentModel.findByIdAndDelete(studentId);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'An unknown server error occured.',
      );
    }
  }

  /** Not exposed by a controller, but to be used by other services like auth */
  /**
   * @summary Check if an email exists in the student records.
   * @param email - Email to check.
   * @returns Promise that resolves to a boolean indicating email existence.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const exists = await this.studentModel.exists({ email });
      return !!exists; // converting to boolean
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Get a student by email.
   * @param email - Email of the student to retrieve.
   * @returns Promise that resolves to the student details.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getStudentByEmail(email: string): Promise<Student> {
    try {
      const student = await this.studentModel.findOne({ email });
      return student;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  // this method is invoked by another service (auth), not exposed to a controller.
  // so there is no need to make validations, tutor will be created after temp user
  // was created, and all validations were made.
  /**
   * @summary Create a new student.
   * @param student - Student data for creation.
   * @returns Promise that resolves to the created student details.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async createStudent(student: CreateStudentDTO): Promise<StudentDTO> {
    try {
      // create tutor
      const createdStudent = await this.studentModel.create(student);
      // omitting sensitive information (_id and password) before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...createdStudentWithoutSensitiveInfo } =
        createdStudent.toObject();
      // returning the created tutor without sensitive information
      return createdStudentWithoutSensitiveInfo;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Add an appointment ID to a student's appointments list.
   * @param studentId - ID of the student.
   * @param appointmentId - ID of the appointment to add.
   * @throws NotFoundException if the student is not found.
   */
  async addAppointment(studentId: string, appointmentId: string) {
    try {
      await this.studentModel.findByIdAndUpdate(studentId, {
        $push: { appointments: appointmentId },
      });
    } catch (err) {
      console.log(err);
      throw new NotFoundException('Student not found');
    }
  }

  /**
   * @summary Find a student by ID.
   * @param id - ID of the student to find.
   * @returns Promise that resolves to the found student.
   */
  async findById(id: string) {
    return this.studentModel.findById(id);
  }
}
