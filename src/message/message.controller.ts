import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Response } from 'express';
import { CreateMessageDTO } from './dto/create-message.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * @summary Get the user's latest messages.
   * @param req - The request object.
   * @param res - The response object.
   * @throws Error if an error occurs while retrieving the latest messages.
   */
  @Get('/latest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the user's latest messages" })
  @ApiOkResponse({
    description: 'Latest messages retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description:
      'Latest messages not found or an unknown server error occurred.',
  })
  async getUserLatestMessage(@Request() req, @Res() res: Response) {
    const userId = req['userId'];
    const userRole = req['userRole'];
    try {
      const latestMessages = await this.messageService.getUserLatestMessages(
        userId,
        userRole,
      );
      res.json(latestMessages);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Get messages between the user and another user.
   * @param req - The request object.
   * @param otherUserId - ID of the other user.
   * @param res - The response object.
   * @throws Error if an error occurs while retrieving messages between users.
   */
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get messages between the user and another user' })
  @ApiParam({ name: 'id', description: 'ID of the other user' })
  @ApiOkResponse({
    description: 'Messages retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Messages not found or an unknown server error occurred.',
  })
  async getUserMessages(
    @Request() req,
    @Param('id') otherUserId: string,
    @Res() res: Response,
  ) {
    const userId = req['userId'];
    const userRole = req['userRole'];
    try {
      const messages = await this.messageService.getPairMessages(
        userId,
        otherUserId,
        userRole,
      );
      res.json(messages);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary Create a new message.
   * @param req - The request object.
   * @param message - Message data.
   * @param res - The response object.
   * @throws Error if an error occurs while creating a new message.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDTO, description: 'Message data' })
  @ApiCreatedResponse({
    description: 'Message sent successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Receiver not found or an unknown server error occurred.',
  })
  @ApiForbiddenResponse({
    description: 'Cannot send message to a user of the same type.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unknown server error occurred.',
  })
  async createMessage(
    @Request() req,
    @Body() message: CreateMessageDTO,
    @Res() res: Response,
  ) {
    const userId = req['userId'];
    const userRole = req['userRole'];
    try {
      const createdMessage = await this.messageService.sendMessage(
        userId,
        userRole,
        message,
      );
      res.json(createdMessage);
    } catch (err) {
      throw err;
    }
  }
}
