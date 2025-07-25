import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentsCoursesService } from './students_courses.service';
import { CreateStudentsCourseDto } from './dto/create-students_course.dto';
import { UpdateStudentsCourseDto } from './dto/update-students_course.dto';

@Controller('students-courses')
export class StudentsCoursesController {
  constructor(private readonly studentsCoursesService: StudentsCoursesService) {}

  @Post()
  create(@Body() createStudentsCourseDto: CreateStudentsCourseDto) {
    return this.studentsCoursesService.create(createStudentsCourseDto);
  }

  @Get()
  findAll() {
    return this.studentsCoursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsCoursesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentsCourseDto: UpdateStudentsCourseDto) {
    return this.studentsCoursesService.update(+id, updateStudentsCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsCoursesService.remove(+id);
  }
}
