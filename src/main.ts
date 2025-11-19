import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env.validation';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';

async function bootstrap() {
  const logger = new Logger('NestApplication');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService<Env, true>);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  logger.log(
    `Application is running on port: ${process.env.PORT ?? (await app.getUrl())} 🚀`,
  );
}
bootstrap();
