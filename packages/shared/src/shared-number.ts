import { type EnvShared } from "./env";

export function getSharedNumber(input: EnvShared): number {
    return input.SHARED_NUMBER;
}
