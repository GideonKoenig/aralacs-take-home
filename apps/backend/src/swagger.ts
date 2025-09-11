import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from '@/app.module.js';
import { env } from '@/env.js';

async function generate() {
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
    await app.close();
}

void generate();
