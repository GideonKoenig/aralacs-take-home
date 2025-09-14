import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "@/app/app.module.js";
import {
    FastifyAdapter,
    type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { env } from "@/env.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HttpExceptionFilter } from "@/lib/http-exception.filter.js";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle("API")
        .setDescription("API documentation")
        .setVersion("1.0.0")
        .addServer(`${env.SITE_URL}:${env.PORT.toString()}`)
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const outputPath = join(process.cwd(), "openapi.json");
    if (env.NODE_ENV === "development") {
        writeFileSync(outputPath, JSON.stringify(document, null, 2));
    }

    SwaggerModule.setup("docs", app, document);
    app.enableShutdownHooks();
    app.enableCors({ origin: true, credentials: true });
    await app.listen(env.PORT, "::");
}
void bootstrap().then(() => {
    console.log(`Server is running on ${env.SITE_URL}:${env.PORT.toString()}`);
    console.log(
        `OpenAPI documentation is available at ${env.SITE_URL}:${env.PORT.toString()}/docs`,
    );
});
