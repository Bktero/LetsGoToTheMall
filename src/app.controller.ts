import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs')
  @ApiResponse({
    status: 302,
    description: "Redirects to the project's documentation",
  })
  root(): void {}
}
