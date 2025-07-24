import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  CreateUserDto,
  LoginUserDto,
  TokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../users/dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Foydalanuvchini ro‘yxatdan o‘tkazish" })
  @ApiResponse({ status: 201, type: TokenDto })
  async register(@Body() dto: CreateUserDto): Promise<TokenDto> {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Foydalanuvchini tizimga kiritish" })
  @ApiResponse({ status: 200, type: TokenDto })
  async login(@Body() dto: LoginUserDto): Promise<TokenDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post("activate")
  @ApiOperation({ summary: "Email orqali aktivatsiya qilish" })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi muvaffaqiyatli aktivlashtirildi",
  })
  async activate(@Query("link") activationLink: string): Promise<void> {
    return this.authService.activate(activationLink);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tokenlarni yangilash" })
  @ApiResponse({ status: 200, type: TokenDto })
  async refresh(@Body() body: { token: string }): Promise<TokenDto> {
    return this.authService.refreshToken(body.token);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Parolni tiklash uchun email yuborish" })
  @ApiResponse({
    status: 200,
    description: "Parolni tiklash uchun email yuborildi",
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Token orqali parolni yangilash" })
  @ApiResponse({ status: 200, description: "Parol muvaffaqiyatli yangilandi" })
  async resetPassword(
    @Body() dto: ResetPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
