import { Injectable } from "@nestjs/common";
import { CreateStudentsCourseDto } from "./dto/create-students_course.dto";
import { UpdateStudentsCourseDto } from "./dto/update-students_course.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudentsCoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createStudentsCourseDto: CreateStudentsCourseDto) {
    return this.prismaService.studentCourses.create({
      data: createStudentsCourseDto,
    });
  }

  findAll() {
    return this.prismaService.studentCourses.findMany({
      include: { Course: true, Student: true },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} studentsCourse`;
  }

  update(id: number, updateStudentsCourseDto: UpdateStudentsCourseDto) {
    return `This action updates a #${id} studentsCourse`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentsCourse`;
  }
}
