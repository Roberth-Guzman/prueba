import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async handleChat(@Body() body: { message: string }) {
    const respuesta = await this.appService.chat(body.message);
    return { respuesta };
  }
}
