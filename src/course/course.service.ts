import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './course.model';
import { UpdateCourseDTO } from './dto/update-course-dto';
import { CreateCourseDTO } from './dto/create-course.dto';
import { StudentService } from 'src/student/student.service';
import { TutorService } from 'src/tutor/tutor.service';

/**
 * @summary Service responsible for handling course-related operations.
 */
@Injectable()
export class CourseService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<Course>,
    private readonly studentService: StudentService,
    private readonly tutorService: TutorService,
  ) {}

  /**
   * @summary Creates a new course.
   * @param tutorId - ID of the tutor creating the course.
   * @param course - Data for creating a new course.
   * @returns The newly created course.
   * @throws NotFoundException if the tutor is not found.
   */
  async createCourse(
    tutorId: string,
    course: CreateCourseDTO,
  ): Promise<Course> {
    // making sure tutor exists
    const tutor = await this.tutorService.getTutor(tutorId);
    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }
    // creating course
    const createdCourse = new this.courseModel({
      tutor: tutorId,
      courseName: course.courseName,
      level: course.level,
      coverPhoto: course.coverPhoto,
      documents: [[], [], [], [], [], [], []], // 7 weeks by default
    });
    const response = await createdCourse.save();
    return response;
  }

  /**
   * @summary Retrieves a course by ID.
   * @param courseId - ID of the course.
   * @returns The course details.
   */
  async getCourseById(courseId: string): Promise<Course> {
    return await this.courseModel
      .findById(courseId)
      .populate('students')
      .populate('tutor');
  }

  /**
   * @summary Gets courses for a user based on their role (tutor or student).
   * @param userId - ID of the user.
   * @param userRole - Role of the user (tutor or student).
   * @returns List of courses for the user.
   * @throws NotFoundException if the user is not found.
   */
  async getCoursesForUser(userId: string, userRole: string) {
    if (userRole.toLowerCase() === 'tutor') {
      return await this.courseModel.find({ tutor: userId });
    } else if (userRole.toLowerCase() === 'student') {
      return await this.courseModel
        .find({ students: userId })
        .populate('tutor');
    } else {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * @summary Updates a course by ID.
   * @param courseId - ID of the course to be updated.
   * @param updatedCourseData - Updated course data.
   * @returns The updated course.
   * @throws NotFoundException if the course is not found.
   */
  async updateCourse(
    courseId: string,
    updatedCourseData: UpdateCourseDTO,
  ): Promise<Course> {
    // Find the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Update the course data
    Object.assign(course, updatedCourseData);

    // Save the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Deletes a course by ID.
   * @param courseId - ID of the course to be deleted.
   * @throws NotFoundException if the course is not found.
   */
  async deleteCourse(courseId: string) {
    // finding the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    // removing the course
    await this.courseModel.findByIdAndDelete(courseId);
  }

  /**
   * @summary Adds a student to a course.
   * @param courseId - ID of the course.
   * @param studentId - ID of the student.
   * @returns The updated course.
   * @throws NotFoundException if the course or student is not found.
   * @throws Error if the student is already enrolled in the course.
   */
  async addStudentToCourse(
    courseId: string,
    studentId: string,
  ): Promise<Course> {
    // finding the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // finding the student
    const student = await this.studentService.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // checking if the student is already in the course
    const isStudentAlreadyEnrolled = course.students.includes(studentId);
    if (isStudentAlreadyEnrolled) {
      throw new Error('Student is already enrolled in the course');
    }

    // adding the student to the course
    course.students.push(studentId);

    // saving the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Removes a student from a course.
   * @param courseId - ID of the course.
   * @param studentId - ID of the student.
   * @returns The updated course.
   * @throws NotFoundException if the course or student is not found.
   * @throws NotFoundException if the student is not enrolled in the course.
   */
  async removeStudentFromCourse(
    courseId: string,
    studentId: string,
  ): Promise<Course> {
    // retrieving the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // retrieving the student
    const student = await this.studentService.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // checking if the student is enrolled in the course
    const studentIndex = course.students.indexOf(studentId);
    if (studentIndex === -1) {
      throw new NotFoundException('Student is not enrolled in the course');
    }

    // removing the student from the course
    course.students.splice(studentIndex, 1);

    // saving the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Adds a week to a course.
   * @param courseId - ID of the course.
   * @returns The updated course.
   * @throws NotFoundException if the course is not found.
   */
  async addWeek(courseId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Add an empty array for a new week
    course.documents.push([]);

    // Save the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Deletes a week from a course.
   * @param courseId - ID of the course.
   * @param weekIndex - Index of the week to be deleted.
   * @returns The updated course.
   * @throws NotFoundException if the course is not found.
   * @throws NotFoundException if the week index is invalid.
   */
  async deleteWeek(courseId: string, weekIndex: number): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if the weekIndex is valid
    if (weekIndex < 0 || weekIndex >= course.documents.length) {
      throw new NotFoundException('Invalid week index');
    }

    // Remove the week at the specified index
    course.documents.splice(weekIndex, 1);

    // Save the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Adds a file to a week in a course.
   * @param courseId - ID of the course.
   * @param weekIndex - Index of the week.
   * @param file - File data in string format.
   * @returns The updated course.
   * @throws NotFoundException if the course is not found.
   * @throws NotFoundException if the week index is invalid.
   */
  async addFile(
    courseId: string,
    weekIndex: number,
    file: string,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if the weekIndex is valid
    if (weekIndex < 0 || weekIndex >= course.documents.length) {
      throw new NotFoundException('Invalid week index');
    }

    // Add the file to the specified week
    course.documents[weekIndex].push(file);

    // Save the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }

  /**
   * @summary Deletes a file from a week in a course.
   * @param courseId - ID of the course.
   * @param weekIndex - Index of the week.
   * @param fileIndex - Index of the file to be deleted.
   * @returns The updated course.
   * @throws NotFoundException if the course is not found.
   * @throws NotFoundException if the week index is invalid.
   * @throws NotFoundException if the file index is invalid.
   */
  async deleteFile(
    courseId: string,
    weekIndex: number,
    fileIndex: number,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if the weekIndex is valid
    if (weekIndex < 0 || weekIndex >= course.documents.length) {
      throw new NotFoundException('Invalid week index');
    }

    // Check if the fileIndex is valid
    if (fileIndex < 0 || fileIndex >= course.documents[weekIndex].length) {
      throw new NotFoundException('Invalid file index');
    }

    // Remove the file at the specified fileIndex in the specified week
    course.documents[weekIndex].splice(fileIndex, 1);

    // Save the updated course
    const updatedCourse = await course.save();
    return updatedCourse;
  }
}
