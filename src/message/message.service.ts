import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message } from './message.model';
import { StudentService } from 'src/student/student.service';
import { TutorService } from 'src/tutor/tutor.service';
import { UserRole } from 'src/utils/types';
import { CreateMessageDTO } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  // injecting student model
  /**
   * @summary Service responsible for handling message-related operations.
   * @param messageModel - The injected mongoose Model for the 'Message' entity.
   * @param tutorService - Instance of TutorService for interaction with tutor data.
   * @param studentService - Instance of StudentService for interaction with student data.
   */
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly tutorService: TutorService,
    private readonly studentService: StudentService,
  ) {}

  /**
   * @summary Get messages between the logged-in user and another user.
   * @param loggedUserId - ID of the logged-in user.
   * @param otherUserId - ID of the other user.
   * @param userRole - Role of the logged-in user (either 'tutor' or 'student').
   * @returns Promise that resolves to an array of messages between the users.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getPairMessages(
    loggedUserId: string,
    otherUserId: string,
    userRole: UserRole,
  ): Promise<Message[]> {
    try {
      // variables to check userRole without repeating code
      const checkIsTutor = () => userRole.toLowerCase() === 'tutor';
      const checkIsStudent = () => userRole.toLowerCase() === 'student';

      // retrieve messages
      let messages: Message[];
      if (checkIsStudent()) {
        messages = await this.messageModel
          .find({
            student: loggedUserId,
            tutor: otherUserId,
          })
          .populate('tutor');
      } else if (checkIsTutor()) {
        messages = await this.messageModel
          .find({
            tutor: loggedUserId,
            student: otherUserId,
          })
          .populate('student');
      }
      return messages;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknow server error occured');
    }
  }

  /**
   * @summary Send a message from the logged-in user to another user.
   * @param senderId - ID of the sender (logged-in user).
   * @param senderRole - Role of the sender (either 'tutor' or 'student').
   * @param data - Message data from the CreateMessageDTO.
   * @returns Promise that resolves to the created message.
   * @throws NotFoundException if the receiver is not found.
   * @throws ForbiddenException if the sender attempts to send a message to a user of the same type.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async sendMessage(
    senderId: string,
    senderRole: UserRole,
    data: CreateMessageDTO,
  ): Promise<Message> {
    const { receiverId, messageContent } = data;

    try {
      const isSenderStudent = senderRole.toLowerCase() === 'student';
      const isSenderTutor = senderRole.toLowerCase() === 'tutor';

      // validating receiver
      const isReceiverTutor = await this.tutorService.findById(receiverId);
      const isReceiverStudent = await this.studentService.findById(receiverId);

      if (!isReceiverStudent && !isReceiverTutor) {
        throw new NotFoundException('Message receiver not found');
      }
      // if user is sending to user of same type => throw error
      if (
        (isSenderTutor && isReceiverTutor) ||
        (isReceiverStudent && isSenderStudent)
      ) {
        throw new ForbiddenException(
          'Cannot send message to user of same type.',
        );
      }

      // Creating the message
      const message = new this.messageModel({
        tutor: isSenderTutor ? senderId : receiverId,
        student: isSenderStudent ? senderId : receiverId,
        sender: isSenderTutor ? 'tutor' : 'student',
        messageContent: messageContent,
      });
      const savedMessage = await message.save();
      return savedMessage;
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('An unknow server error occured');
    }
  }

  /**
   * @summary Get the latest messages for the logged-in user.
   * @param userId - ID of the logged-in user.
   * @param userRole - Role of the logged-in user (either 'tutor' or 'student').
   * @returns Promise that resolves to an array of latest messages.
   * @throws InternalServerErrorException if an unknown server error occurs.
   */
  async getUserLatestMessages(userId: string, userRole: UserRole) {
    try {
      // retrieving the last message document between the logged user and
      // evrery other user he chatted with.
      let messages;

      // fieldsToSelect are common in both queries, we store them in a seperate variable
      const fieldsToSelect = {
        _id: 0,
        tutor: 1,
        sender: 1,
        messageContent: 1,
        timestamp: 1,
        'student._id': 1,
        'student.firstName': 1,
        'student.lastName': 1,
        'student.profilePic': 1,
      };

      if (userRole.toLowerCase() === 'tutor') {
        messages = await this.messageModel.aggregate([
          { $match: { tutor: new mongoose.Types.ObjectId(userId) } },
          { $sort: { timestamp: -1 } },
          {
            $group: {
              _id: '$student',
              tutor: { $first: '$tutor' },
              sender: { $first: '$sender' },
              messageContent: { $first: '$messageContent' },
              timestamp: { $first: '$timestamp' },
            },
          },
          { $addFields: { student: '$_id' } },
          {
            $lookup: {
              from: 'students',
              localField: 'student',
              foreignField: '_id',
              as: 'student',
            },
          },
          { $unwind: '$student' }, // look up returns an array, but since it will contain one element, we destrcture it
          { $project: fieldsToSelect },
        ]);
      } else if (userRole.toLowerCase() === 'student') {
        messages = await this.messageModel.aggregate([
          { $match: { student: new mongoose.Types.ObjectId(userId) } },
          { $sort: { timestamp: -1 } },
          {
            $group: {
              _id: '$tutor',
              student: { $first: '$student' },
              sender: { $first: '$sender' },
              messageContent: { $first: '$messageContent' },
              timestamp: { $first: '$timestamp' },
            },
          },
          { $addFields: { tutor: '$_id' } },
          {
            $lookup: {
              from: 'tutors',
              localField: 'tutor',
              foreignField: '_id',
              as: 'tutor',
            },
          },
          { $unwind: '$tutor' }, // look up returns an array, but since it will contain one element, we destrcture it
          { $project: fieldsToSelect },
        ]);
      }

      return messages;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('An unknow server error occured');
    }
  }
}
