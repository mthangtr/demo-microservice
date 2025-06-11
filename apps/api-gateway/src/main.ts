/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {ConfigService} from "@nestjs/config";
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { 
        logger: new Logger(),
        bodyParser: true, // Enable built-in body parser
    });
    const config = app.get(ConfigService);

    app.enableCors({
        origin: config.get<string>('CORS_ORIGIN') || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Configure body parser limits
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Add request logging middleware only for non-production environments
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res, next) => {
        // Log only significant endpoints or methods to reduce noise
        if (req.method !== 'GET' || req.url.includes('/auth/')) {
          Logger.log(`Incoming request: ${req.method} ${req.url}`);
        }
        next();
      });
    }

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = config.get<number>('PORT');
    await app.listen(port);
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
}

void bootstrap();
