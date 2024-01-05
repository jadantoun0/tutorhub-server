import { MongooseModule } from '@nestjs/mongoose';
import { StudentModule } from './student/student.module';
import { MyConfigModule } from '../config.module';
import { TutorModule } from './tutor/tutor.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { MessageModule } from './message/message.module';
import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { FileModule } from './file/file.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    MyConfigModule, // configurations for .env
    FileModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    StudentModule,
    AuthModule,
    TutorModule,
    AppointmentModule,
    MessageModule,
    CourseModule,
    WebsocketsModule,
  ],
})
export class AppModule {}
