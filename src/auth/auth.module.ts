import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  AccessTokenStrategy,
  RefreshTokenCookieStrategy,
} from "../common/strategoes";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>("ACCESS_TOKEN_KEY"),
        signOptions: {
          expiresIn: config.get<string>("ACCESS_TOKEN_TIME"),
        },
      }),
    }),
    PrismaModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenCookieStrategy],
})
export class AuthModule {}
