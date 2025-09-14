import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "@/app.service.js";

@Controller()
export class AppController {
    constructor(@Inject(AppService) private readonly appService: AppService) {}

    @Get()
    async getHello(): Promise<string> {
        return this.appService.getHello();
    }
}
