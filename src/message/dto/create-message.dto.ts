import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty({
    description: 'ID of the message receiver',
    example: 'user123',
  })
  @IsNotEmpty({ message: 'Receiver ID must be specified' })
  receiverId: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty({ message: 'Message content must be specified' })
  messageContent: string;
}
