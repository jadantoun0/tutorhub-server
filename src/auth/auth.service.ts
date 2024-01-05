import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { TempUser } from './temp-user-model';
import { TutorService } from 'src/tutor/tutor.service';
import { StudentService } from 'src/student/student.service';
import { CreateTempUserDTO } from './dto/create-temp-user-dto';
import { TempUserDTO } from './dto/temp-user-dto';
import { UserRole } from 'src/utils/types';
import { JwtService } from '@nestjs/jwt';
import { StudentDTO } from 'src/student/dto/student-dto';
import { TutorDTO } from 'src/tutor/dto/tutor-dto';
import { Student } from 'src/student/student.model';
import { Tutor } from 'src/tutor/tutor.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('TemporaryUser') private tempUserModel: Model<TempUser>,
    private readonly tutorService: TutorService,
    private readonly studentService: StudentService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @summary Register a temporary user for email verification
   * @param userToCreate - The data of the user to be registered
   * @returns Registered temporary user data
   */
  async register(userToCreate: CreateTempUserDTO): Promise<TempUserDTO> {
    try {
      const { email, password, role } = userToCreate;
      // checking if email is already in use
      let emailInUse = await this.studentService.checkEmailExists(email);
      // if email not used by a student, we search if its used by a tutor
      if (!emailInUse) {
        emailInUse = await this.tutorService.checkEmailExists(email);
      }

      if (emailInUse) {
        throw new ConflictException('Email already in use. Try another');
      }

      // email is valid => we send a verification email
      const hashedOTP = await this.sendOTPVerification(email);
      const hashedPassword = await bcrypt.hash(password, 10);

      // delete previous temporary users before creating a new one
      // (if the user registered previously but did not validate the email)
      await this.tempUserModel.deleteOne({ email });
      const temporaryUser = new this.tempUserModel({
        email,
        password: hashedPassword,
        role,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60, // 1hr
      });
      await temporaryUser.save();
      return {
        email: temporaryUser.email,
        role: temporaryUser.role as UserRole, // casting to UserRole
      };
    } catch (err) {
      // if err is thrown by us previously
      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err; // throw it as it is to maintain err msgs
      }
      // else
      console.log(err.message);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  /**
   * @summary Verify user email with OTP
   * @param email - Email to be verified
   * @param otp - Verification code
   * @returns User data and access token upon successful verification
   */
  async verifyEmail(
    email: string,
    otp: string,
  ): Promise<{ data: StudentDTO | TutorDTO; accessToken: string }> {
    try {
      const tempUser = await this.tempUserModel.findOne({ email });
      if (!tempUser) {
        throw new NotFoundException(
          'Account does not exist or has been verified already. Please register again or sign in.',
        );
      }
      if (!otp) {
        throw new NotFoundException('Verification code is not specified.');
      }
      const validOTP = await bcrypt.compare(otp, tempUser.otp);

      if (!validOTP) {
        throw new UnauthorizedException('Invalid verification code');
      }
      if (tempUser.expiresAt.getTime() < Date.now()) {
        this.tempUserModel.deleteOne({ _id: tempUser._id });
        throw new BadRequestException(
          'Your verification code has expired. Register again.',
        );
      }
      // email verified => create user
      // delete temp user (it will be officically created now)
      await this.tempUserModel.findByIdAndDelete(tempUser._id);

      let createdUser: StudentDTO | TutorDTO;
      const newUserParameters = {
        email: tempUser.email,
        role: tempUser.role,
        password: tempUser.password,
      };
      if (tempUser.role === 'student') {
        createdUser =
          await this.studentService.createStudent(newUserParameters);
      }
      // tutor
      else {
        createdUser = await this.tutorService.createTutor(newUserParameters);
      }

      const accessToken = await this.jwtService.signAsync({
        userId: createdUser._id,
        userRole: createdUser.role,
      });
      return { data: createdUser, accessToken };
    } catch (err) {
      // if we manually threw the error
      if (
        err instanceof UnauthorizedException ||
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('An unknown server error occured');
    }
  }

  /**
   * @summary Resend OTP for email verification
   * @param email - Email to resend OTP
   */
  async resendOTP(email: string): Promise<void> {
    try {
      const tempUser = await this.tempUserModel.findOne({ email });

      if (!tempUser) {
        throw new NotFoundException(
          'Account does not exist or has already been verified. Register again or sign in.',
        );
      }

      if (Date.now() - tempUser.createdAt.getTime() < 1000 * 60 * 2) {
        throw new ForbiddenException(
          'Wait 2 mins before requesting a new verification code.',
        );
      }

      // email is valid => we send a verification email
      const otp = await this.sendOTPVerification(email);

      await this.tempUserModel.findOneAndUpdate(
        { email },
        {
          otp: otp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 1000 * 60 * 60, // 1h
        },
      );
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      // else => internal server error
      console.log(err);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  /**
   * @summary Sign in a user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns User data and access token upon successful sign-in
   */
  async signin(
    email: string,
    password: string,
  ): Promise<{ data: StudentDTO | TutorDTO; accessToken: string }> {
    try {
      let user: Student | Tutor;

      // checking if user is student
      user = await this.studentService.getStudentByEmail(email);

      // checking if user is tutor
      if (!user) {
        user = await this.tutorService.getTutorByEmail(email);
      }

      // if we still didnt find the user, then incorrect email
      if (!user) {
        throw new UnauthorizedException('Invalid email address');
      }

      const correctPassowrd = await bcrypt.compare(password, user.password);

      // incorrect password
      if (!correctPassowrd) {
        throw new UnauthorizedException(
          'The password you entered is incorrect',
        );
      }

      // authorized, we generate an access token
      const accessToken = await this.jwtService.signAsync({
        userId: user._id,
        userRole: user.role,
      });
      // removing password to avoid returning it to the user
      return { data: user, accessToken };
    } catch (err) {
      // if an error we threw manually, we throw it as it is to maintain err msg
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException(
        'An internal server error occured',
      );
    }
  }

  /**
   * @summary Send an OTP verification email to the user
   * @param email - User's email
   * @returns Hashed OTP for verification
   */
  /** This function is invoked by a service, not exposed to a controller */
  async sendOTPVerification(email: string): Promise<string> {
    // generate an OTP (4 random numbers)
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    // setting up
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Verify your email',
      html: `
                <p>
                Your email verification code is <b>${otp} </b>
                <br>
                If this was not you, please ignore this email.
                </p>`,
    };

    // sending email containig OTP
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        throw new NotFoundException(
          'Error sending email. Make sure email is valid',
        );
      }
    });
    // hasing OTP
    const hashedOTP = await bcrypt.hash(otp, 10);
    return hashedOTP;
  }

  /**
   * @summary Get details of the logged-in user
   * @param userId - User ID
   * @param userRole - User role (student or tutor)
   * @returns Details of the logged-in user
   */
  async getLoggedUser(userId: string, userRole: string) {
    if (userRole.toLowerCase() === 'tutor') {
      return await this.tutorService.getTutor(userId);
    }
    return await this.studentService.getStudent(userId);
  }
}
