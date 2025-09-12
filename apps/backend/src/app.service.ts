import { env } from "@/env.js";
import { Injectable } from "@nestjs/common";
import { getSharedNumber } from "@scalara/shared/shared-number";

@Injectable()
export class AppService {
    getHello(): string {
        const sharedNumber = getSharedNumber(env);
        return `Hello World from NestJs. ${sharedNumber.toString()}`;
    }
}
