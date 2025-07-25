import { Module } from "@nestjs/common";
import { StudentsCoursesService } from "./students_courses.service";
import { StudentsCoursesController } from "./students_courses.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StudentsCoursesController],
  providers: [StudentsCoursesService],
})
export class StudentsCoursesModule {}
