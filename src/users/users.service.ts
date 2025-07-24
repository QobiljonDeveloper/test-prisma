import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto";
import { UpdateUserDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
@Injectable()
export class UsersService {
  constructor(private readonly prismaSedrvice: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { name, email, phone, password, confirm_password } = createUserDto;
    if (password != confirm_password) {
      throw new BadRequestException("Parollar mos emas");
    }
    const hashedPassword = await bcrypt.hash(password!, 7);

    return this.prismaSedrvice.user.create({
      data: {
        name,
        email,
        phone,
        hashedPassword,
      },
    });
  }

  findAll() {
    return this.prismaSedrvice.user.findMany();
  }

  findOne(id: number) {
    return this.prismaSedrvice.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaSedrvice.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prismaSedrvice.user.delete({ where: { id } });
  }
}
