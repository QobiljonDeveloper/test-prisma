import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateUserDto, TokenDto } from "../users/dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { JwtPayload, ResponseFields } from "../common/types";
import { Response } from "express";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: CreateUserDto): Promise<ResponseFields> {
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
        is_active: false,
      },
    });

    await this.mailService.sendActivationLink(user.email, activationLink);

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.is_active
    );

    return {
      message: "Foydalanuvchi tizimga muvaffaqiyatli kiritildi",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }

  async login(email: string, password: string): Promise<TokenDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Foydalanuvchi topilmadi");
    if (!user.is_active)
      throw new UnauthorizedException("Hisob aktivlashtirilmagan");

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) throw new UnauthorizedException("Parol noto‘g‘ri");

    return this.generateTokens(user.id, user.email, user.is_active);
  }

  async logout(userId: number, res: Response): Promise<boolean> {
    const user = await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    if (user.count === 0) {
      throw new ForbiddenException("Access denied");
    }

    res.clearCookie("refreshToken");
    return true;
  }

  async activate(activationLink: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { activationLink },
    });
    if (!user) throw new BadRequestException("Noto‘g‘ri aktivatsiya havolasi");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { is_active: true, activationLink: null },
    });
  }

  async refresh_token(
    userId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException("User topilmadi");

    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    );
    if (!rtMatches) throw new UnauthorizedException("Refresh token noto‘g‘ri");

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.is_active
    );

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 7);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: +process.env.REFRESH_TOKEN_TIME!,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      message: "Tokenlar yangilandi",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException("Foydalanuvchi topilmadi");

    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 30);

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
    email: string,
    is_active: boolean
  ): Promise<TokenDto> {
    const payload: JwtPayload = { id: userId, email, is_active };

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
