import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ShichimiyaContext } from './smalltalk/types/ShichimiyaContext';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('echo')
  echo(@Ctx() context: ShichimiyaContext): string {
    console.log('Echoing args: ', context.args);
    return context.args.join(' ');
  }
}
