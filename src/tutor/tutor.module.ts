import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { tutorSchema } from './tutor.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tutor', schema: tutorSchema }]),
  ],
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
