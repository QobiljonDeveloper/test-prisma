import { Injectable } from "@nestjs/common";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudentsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createStudentDto: CreateStudentDto) {
    return this.prismaService.student.create({
      data: createStudentDto,
    });
  }

  findAll() {
    return this.prismaService.student.findMany({
      include: { student_courses: { include: { Student: true } } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
