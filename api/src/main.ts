import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export async function bootstrap() {
  const port = process.env.PORT ?? 3001;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // ── Global Middleware ────────────────────────────────────────────────────
  // Validation Pipe: validates all incoming DTOs against class-validator
  // decorators before they reach any controller method.
  // - transform:true           → converts payload types (e.g. string → number)
  // - whitelist:true           → strips properties not present in the DTO
  // - forbidNonWhitelisted:true → throws 400 if unknown properties are sent
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Serializer Interceptor: strips out sensitive fields (e.g. passwordHash)
  // when objects are returned from any controller, except where @Exclude()
  // is explicitly used on the class-transformer side.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(port);
  console.log(`Server listen in http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
