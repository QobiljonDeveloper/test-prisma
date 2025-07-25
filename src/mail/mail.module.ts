import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.smtp_host,
        port: parseInt(process.env.smtp_port!),
        secure: false,
        auth: {
          user: process.env.smtp_user,
          pass: process.env.smtp_password,
        },
      },
      defaults: {
        from: `"MyRestaurant" <${process.env.smtp_user}>`,
      },
      template: {
        dir: join(__dirname, "templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
