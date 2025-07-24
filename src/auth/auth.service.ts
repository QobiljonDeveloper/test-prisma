import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { MailService } from "../mail/mail.service";
import { CreateUserDto, TokenDto } from "../users/dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: CreateUserDto): Promise<TokenDto> {
    const candidate = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (candidate) throw new BadRequestException("User already exists");

    const hashPassword = await bcrypt.hash(dto.password!, 10);
    const activationLink = Math.random().toString(36).substring(2, 15);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        hashedPassword: hashPassword,
        activationLink,
        isActive: false,
      },
    });

    await this.mailService.sendActivationLink(user.id);
    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string): Promise<TokenDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("User not found");

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) throw new UnauthorizedException("Wrong password");

    return this.generateTokens(user.id, user.email);
  }

  async activate(activationLink: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { activationLink },
    });
    if (!user) throw new BadRequestException("Invalid activation link");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
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
      if (!user) throw new UnauthorizedException("User not found");

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException("User not found");

    const token = Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 daqiqa

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    await this.mailService.sendResetPasswordLink(user.email, token);

    return { message: "Parolni tiklash havolasi yuborildi" };
  }
  
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() },
      },
    });
    if (!user) throw new BadRequestException("Token invalid or expired");

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Parol muvaffaqiyatli yangilandi" };
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
