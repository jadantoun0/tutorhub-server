import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './course.model';
import { StudentModule } from 'src/student/student.module';
import { TutorModule } from 'src/tutor/tutor.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
    StudentModule,
    TutorModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
