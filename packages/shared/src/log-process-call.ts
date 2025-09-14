import {
    ProcessExecutionLogEntity,
    type PostgresConnection,
} from "@scalara/db";
import { Failure, Success, tryCatch } from "./try-catch.js";

export async function logProcessExecution(
    postgres: PostgresConnection,
    processedCount: number,
    startLoadedAt: Date,
    endLoadedAt: Date,
) {
    const result = await tryCatch(
        postgres
            .getRepository(ProcessExecutionLogEntity)
            .createQueryBuilder()
            .insert()
            .values({
                processedCount,
                startLoadedAt,
                endLoadedAt,
            })
            .execute(),
    );
    if (!result.success) return new Failure(result.error);
    return new Success<void>(undefined);
}

export async function getLastProcessExecution(postgres: PostgresConnection) {
    const result = await tryCatch(
        postgres
            .getRepository(ProcessExecutionLogEntity)
            .createQueryBuilder("pel")
            .orderBy("pel.executedAt", "DESC")
            .getOne(),
    );
    return result;
}
