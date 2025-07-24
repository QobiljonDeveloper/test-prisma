import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService
  ) {}

  async sendActivationLink(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    const url = `${process.env.api_url}/api/auth/activate/${user.activationLink}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: "Accountingizni faollashtiring",
      template: "./confirmation",
      context: {
        name: user.name,
        url,
      },
    });
  }

  async sendResetPasswordLink(email: string, token: string) {
    const url = `${process.env.frontend_url}/reset-password/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: "Parolni tiklash havolasi",
      template: "./reset-password",
      context: {
        url,
      },
    });
  }
}
