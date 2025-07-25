import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { StudentsCoursesModule } from './students_courses/students_courses.module';
import { CoursesModule } from './courses/courses.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }), PrismaModule, UsersModule, AuthModule, OrdersModule, StudentsCoursesModule, CoursesModule, StudentsModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {}
