import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function start() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(cookieParser());

  app.setGlobalPrefix("api");

  const configg = new DocumentBuilder()
    .setTitle("Auth Service API")
    .setDescription("Ro‘yxatdan o‘tish, login, refresh va aktivatsiya")
    .setVersion("1.0")
    .addTag("Auth")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configg);
  SwaggerModule.setup("api/docs", app, document);

  const PORT = config.get<number>("PORT");

  await app.listen(PORT ?? 3030, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
  });
}
start();
