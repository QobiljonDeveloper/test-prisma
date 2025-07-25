import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundError } from "rxjs";

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: createOrderDto.userId },
    });
    if (!user) {
      throw new NotFoundException("Bunday foydalanuvchi mavjud emas");
    }
    return this.prismaService.order.create({
      data: {
        total: createOrderDto.total,
        User: {
          connect: { id: createOrderDto.userId },
        },
      },
    });
  }

  findAll() {
    return this.prismaService.order.findMany({
      include: { User: { select: { id: true, name: true } } },
    });
  }

  findOne(id: number) {
    return this.prismaService.order.findUnique({
      where: { id },
      include: { User: true },
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
