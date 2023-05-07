import { RpcExceptionFilter, ArgumentsHost, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SmallTalkExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: RpcException, _host: ArgumentsHost): Observable<any> {
    return of(`There was a problem: ${exception.message}`);
  }
}
