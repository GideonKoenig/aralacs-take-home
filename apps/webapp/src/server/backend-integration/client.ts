import createClient from "openapi-fetch";
import type { paths } from "@/server/backend-integration/openapi-types";
import { env } from "@/env";

export function getBackendClient(baseUrl: string = env.BACKEND_URL) {
    return createClient<paths>({ baseUrl });
}

export const backendClient = getBackendClient();
