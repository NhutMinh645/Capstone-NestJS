import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "./common/response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { setupSwagger } from "./common/swagger/swagger.config";
import { ValidationPipe } from "@nestjs/common";
import { PrismaClientExceptionFilter } from "./common/filters/prisma-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  process.on("unhandledRejection", (reason: any, promise) => {
    console.error("[unhandledRejection] ========");
    console.error("Reason :", reason);
    console.error("Promise:", promise);
    console.error("================================");
  });

  process.on("uncaughtException", (err: Error) => {
    console.error("[uncaughtException] =========");
    console.error("Name   :", err.name);
    console.error("Message:", err.message);
    console.error("Stack  :", err.stack);
    console.error("================================");
  });
  app.useStaticAssets(
    join(process.cwd(), process.env.UPLOAD_DIR || "uploads"),
    { prefix: "/uploads" }
  );
  app.setGlobalPrefix("api");
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });
  setupSwagger(app);
  const port = Number(process.env.PORT || 3069);
  await app.listen(port);
  console.log("Swagger:", `http://localhost:${port}/swagger`);
}
bootstrap();
