import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SmallTalkExceptionFilter } from './smalltalk/smalltalk-exception.filter';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, SmallTalkExceptionFilter],
})
export class AppModule {}
