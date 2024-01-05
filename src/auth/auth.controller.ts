import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTempUserDTO } from './dto/create-temp-user-dto';
import { VerifyEmailDTO } from './dto/verify-email.dto';
import { Response } from 'express';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { SigninDTO } from './dto/signin-dto';
import { Public } from 'src/utils/public.decorator';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TempUserDTO } from './dto/temp-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @summary Register a new user
   * @param userToCreate - The data of the user to be registered
   * @returns The registered user
   */
  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'Temporary user registered successfully.',
    type: TempUserDTO,
  })
  @ApiConflictResponse({
    description: 'Email already in use. Try another.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async registerUser(@Body() userToCreate: CreateTempUserDTO) {
    try {
      const tempUser = await this.authService.register(userToCreate);
      return tempUser;
    } catch (err) {
      throw err; // throwing retuned error as it is to maintain err msgs
    }
  }

  /**
   * @summary Verify user email
   * @param verificationData - Verification data including email and OTP
   * @returns JSON response indicating success and storing access token in a cookie
   */
  @Public()
  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiOkResponse({
    description: 'User email verified successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid verification code.' })
  @ApiNotFoundResponse({
    description:
      'Account does not exist or has been verified already. Please register again or sign in.',
  })
  @ApiBadRequestResponse({ description: 'Verification code is not specified.' })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  @ApiParam({
    name: 'verificationData',
    description: 'Verification data including email and OTP',
  })
  async verifyEmail(
    @Body() verificationData: VerifyEmailDTO,
    @Res() res: Response,
  ) {
    const { email, otp } = verificationData;

    try {
      // call verify service to do the business logic
      const response = await this.authService.verifyEmail(email, otp);
      // success => we store the access token in an http only cookie
      res.cookie('access_token', response.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
      res.json(response.data);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Resend OTP for email verification
   * @param resendOtpDto - DTO containing email for OTP resend
   * @returns No content response on successful OTP resend
   */
  @Public()
  @Post('/resendotp')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Resend OTP for email verification' })
  @ApiOkResponse({
    description: 'OTP resent successfully.',
  })
  @ApiForbiddenResponse({
    description: 'Wait 2 mins before requesting a new verification code.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async resendOTP(@Body() resendOtpDto: ResendOtpDto): Promise<void> {
    try {
      await this.authService.resendOTP(resendOtpDto.email);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Sign in a user
   * @param signinDTO - DTO containing email and password for user sign-in
   * @returns JSON response indicating success and storing access token in a cookie
   */
  @Public()
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiOkResponse({
    description: 'User signed in successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email address or incorrect password.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async signinUser(@Body() signinDTO: SigninDTO, @Res() res: Response) {
    const { email, password } = signinDTO;

    try {
      // call verify service to do the business logic
      const response = await this.authService.signin(email, password);
      // success => we store the access token in an http only cookie
      res.cookie('access_token', response.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
      res.json(response.data);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get logged-in user details
   * @param req - Request object containing user details
   * @returns JSON response with details of the logged-in user
   */
  @Get('/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get logged-in user details' })
  @ApiOkResponse({
    description: 'Details of the logged-in user retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  async getLoggedUser(@Request() req, @Res() res: Response) {
    const response = await this.authService.getLoggedUser(
      req['userId'],
      req['userRole'],
    );
    console.log('check response: ', response);
    res.json(response);
  }

  /**
   * @summary Sign out the user
   * @returns No content response on successful user sign-out
   */
  @Post('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sign out the user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User signed out successfully',
  })
  async logOut(@Res() res: Response) {
    try {
      res.clearCookie('access_token');
      res.json({});
    } catch (err) {
      console.error(err);
      res.json('error occured');
    }
  }
}
