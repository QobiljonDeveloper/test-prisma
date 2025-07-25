import { Injectable } from "@nestjs/common";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createCourseDto: CreateCourseDto) {
    return this.prismaService.course.create({
      data: createCourseDto,
    });
  }

  findAll() {
    return this.prismaService.course.findMany({
      include: { student_courses: { include: { Course: true } } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
