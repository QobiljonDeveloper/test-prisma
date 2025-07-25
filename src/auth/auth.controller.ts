import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto, ForgotPasswordDto } from "../users/dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Foydalanuvchini ro‘yxatdan o‘tkazish" })
  async register(@Body() dto: CreateUserDto): Promise<{ message: string }> {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get("activate/:link")
  @ApiOperation({ summary: "Email orqali aktivatsiya qilish" })
  async activate(
    @Param("link") activationLink: string
  ): Promise<{ message: string }> {
    await this.authService.activate(activationLink);
    return { message: "Hisob muvaffaqiyatli aktivlashtirildi" };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { token: string }) {
    return this.authService.refreshToken(body.token);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Parolni tiklash uchun email yuborish" })
  @ApiResponse({
    status: 200,
    description: "Parolni tiklash havolasi emailga yuborildi",
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }
}
