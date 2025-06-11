import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { Logger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // Add validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
void bootstrap();
