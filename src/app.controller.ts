import { Controller, UseFilters } from '@nestjs/common';
import { Ctx, MessagePattern } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { SmallTalkExceptionFilter } from './smalltalk/smalltalk-exception.filter';
import { ShichimiyaContext } from './smalltalk/types/ShichimiyaContext';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@UseFilters(SmallTalkExceptionFilter)
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

  @MessagePattern('ping')
  ping(): Observable<string> {
    return new Observable((subscriber) => {
      (async () => {
        for (let i = 0; i < 5; i++) {
          subscriber.next(`Pong ${i + 1}`);
          await sleep(1000);
        }
        subscriber.complete();
      })();
    });
  }

  @MessagePattern('exception-test')
  exceptionTest(): void {
    throw new Error('Exception test');
  }

  @MessagePattern('saya')
  saya(@Ctx() context: ShichimiyaContext): string {
    const amount = parseInt(context.args[0], 10);
    if (isNaN(amount)) throw new Error('Invalid amount');

    return 'a'.repeat(amount);
  }
}
