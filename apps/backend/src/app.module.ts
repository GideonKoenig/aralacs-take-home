import { Module } from "@nestjs/common";
import { AppController } from "@/app.controller.js";
import { AppService } from "@/app.service.js";
import { GremlinModule } from "@/gremlin.module.js";

@Module({
    imports: [GremlinModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
