import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module.js';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from '@/env.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );

    const config = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API documentation')
        .setVersion('1.0.0')
        .addServer(`${env.SITE_URL}:${env.PORT}`)
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const outputPath = join(process.cwd(), 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));

    SwaggerModule.setup('docs', app, document);
    await app.listen(env.PORT, '::');
}
void bootstrap().then(() => {
    console.log(`Server is running on ${env.SITE_URL}:${env.PORT}`);
    console.log(
        `OpenAPI documentation is available at ${env.SITE_URL}:${env.PORT}/docs`,
    );
});
