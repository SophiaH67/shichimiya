import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { SmallTalkServer } from './smalltalk/smalltalk.transport';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new SmallTalkServer(),
    },
  );

  await app.listen();
}
bootstrap();
