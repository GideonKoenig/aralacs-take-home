import { Module } from "@nestjs/common";
import { PeopleService } from "@/people/people.service.js";
import { PeopleController } from "@/people/people.controller.js";
import { GremlinModule } from "@/db/gremlin.module.js";

@Module({
    imports: [GremlinModule],
    providers: [PeopleService],
    controllers: [PeopleController],
    exports: [PeopleService],
})
export class PeopleModule {}
