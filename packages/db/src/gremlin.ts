import gremlin from "gremlin";
import type { EnvDb } from "./env.js";

const { driver, process: gprocess } = gremlin;

export type GremlinConnection = Awaited<ReturnType<typeof initializeGremlin>>;

export async function initializeGremlin(env: EnvDb) {
    console.log("Initializing Gremlin");
    const connection = new driver.DriverRemoteConnection(
        env.GREMLIN_DATABASE_URL,
        {
            traversalSource: "g",
            /*
             * Force Node 'ws' client instead of global WebSocket.
             *
             * In gremlin 3.7.x, if no ws-specific options are provided and
             * globalThis.WebSocket exists, the driver uses the global WebSocket
             * (WHATWG/undici EventTarget). That implementation lacks ws-only
             * APIs like `.on()`, causing `this._ws.on is not a function`
             * at connect time.
             *
             * Supplying any ws option (e.g. headers) causes gremlin to import
             * and use the 'ws' module, which supports `.on/.off` and the
             * 'unexpected-response' event. An empty object is sufficient.
             */
            headers: {},
        },
    );
    const g =
        gprocess.AnonymousTraversalSource.traversal().withRemote(connection);
    return {
        g,
        close: async () => connection.close(),
    };
}

export async function testGremlin(env: EnvDb) {
    const gremlin = await initializeGremlin(env);
    const g = gremlin.g;
    const tmp = await g.V().hasLabel("person").values("name").toList();
    await gremlin.close();
    return tmp.length;
}
