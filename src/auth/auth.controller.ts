import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto, ForgotPasswordDto } from "../users/dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ResponseFields } from "../common/types";
import { RefreshTokenGuard } from "../common/guards";
import { GetCurrentUser, GetCurrentUserId } from "../common/decorators";
import { Response } from "express";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Foydalanuvchini ro‘yxatdan o‘tkazish" })
  async register(@Body() dto: CreateUserDto): Promise<ResponseFields> {
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

  @UseGuards(RefreshTokenGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Foydalanuvchini tizimdan chiqish" })
  @ApiResponse({ status: 200, description: "Tizimdan chiqildi" })
  @ApiResponse({ status: 200, description: "Tizimdan chiqildi" })
  async logout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    console.log(userId);
    await this.authService.logout(userId, res);
    return { message: "Tizimdan chiqildi" };
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tokenni yangilash" })
  @ApiResponse({ status: 200, description: "Tokenlar yangilandi" })
  async refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.refresh_token(userId, refreshToken, res);
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
