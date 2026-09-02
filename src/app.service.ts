import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async health (): Promise<string> {
    return 'API HEALTH IS OK';
  }
}
