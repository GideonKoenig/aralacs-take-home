import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

type ErrorBody = {
    message?: string | string[];
    error?: string;
    details?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorType = "InternalServerError";
        let message: string | string[] = "Internal server error";
        let details: unknown = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const raw = exception.getResponse();
            if (typeof raw === "string") {
                message = raw;
            } else if (typeof raw === "object") {
                const res = raw as ErrorBody;
                message = res.message ?? exception.message;
                errorType = res.error ?? exception.name;
                details = res.details;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            errorType = exception.name;
        }

        if (exception instanceof BadRequestException) {
            const badRes = exception.getResponse();
            if (typeof badRes === "object") {
                const res = badRes as ErrorBody & { message?: string[] };
                if (Array.isArray(res.message)) {
                    details = { validationErrors: res.message };
                    errorType = res.error ?? "ValidationError";
                    message = "Validation failed";
                }
            }
        }

        response.status(status).send({
            statusCode: status,
            error: errorType,
            message,
            details,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
