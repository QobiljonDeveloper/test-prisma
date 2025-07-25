import { PartialType } from '@nestjs/swagger';
import { CreateStudentsCourseDto } from './create-students_course.dto';

export class UpdateStudentsCourseDto extends PartialType(CreateStudentsCourseDto) {}
