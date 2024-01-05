import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { messageSchema } from './message.model';
import { StudentModule } from 'src/student/student.module';
import { TutorModule } from 'src/tutor/tutor.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: messageSchema }]),
    StudentModule,
    TutorModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
