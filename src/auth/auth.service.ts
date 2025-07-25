import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateUserDto, TokenDto } from "../users/dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: CreateUserDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException("Bunday foydalanuvchi mavjud");

    const hashedPassword = await bcrypt.hash(dto.password!, 10);
    const activationLink = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        hashedPassword,
        activationLink,
        isActive: false,
      },
    });

    await this.mailService.sendActivationLink(user.email, activationLink);

    return { message: "Aktivatsiya havolasi emailga yuborildi" };
  }

  async login(email: string, password: string): Promise<TokenDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    if (!user.isActive)
      throw new UnauthorizedException("Hisob aktivlashtirilmagan");

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) throw new UnauthorizedException("Parol noto‘g‘ri");

    return this.generateTokens(user.id, user.email);
  }

  async logout(): Promise<{ message: string }> {
    return { message: "Tizimdan chiqildi" };
  }

  async activate(activationLink: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { activationLink },
    });
    if (!user) throw new BadRequestException("Noto‘g‘ri aktivatsiya havolasi");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true, activationLink: null },
    });
  }

  async refreshToken(token: string): Promise<TokenDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException("Foydalanuvchi topilmadi");

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException("Yaroqsiz refresh token");
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException("Foydalanuvchi topilmadi");

    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 daqiqa

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    await this.mailService.sendResetPasswordLink(user.email, token);

    return { message: "Parolni tiklash havolasi emailga yuborildi" };
  }

  private async generateTokens(
    userId: number,
    email: string
  ): Promise<TokenDto> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_TIME || "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_TIME || "7d",
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
