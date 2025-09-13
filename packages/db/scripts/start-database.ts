import { spawn } from "node:child_process";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const scriptPath = resolve(repoRoot, "start-database.sh");

/**
 * Run a command.
 * Pass { quiet: true } to suppress child stdio.
 */
function run(cmd: string, args: string[], options: { quiet?: boolean } = {}) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn(cmd, args, {
            stdio: options.quiet ? "ignore" : "inherit",
            shell: false,
        });
        child.on("error", rejectPromise);
        child.on("exit", (code) => {
            if (code === 0) resolvePromise(void 0);
            else rejectPromise(new Error(`${cmd} exited with code ${code}`));
        });
    });
}

async function main() {
    const plt = platform();

    // macOS/Linux: run bash directly
    if (plt === "darwin" || plt === "linux") {
        await run("bash", [scriptPath]);
        return;
    }

    // Windows: use WSL. run command if WSL is set up
    if (plt === "win32") {
        try {
            await run("wsl", ["-l"], { quiet: true });
        } catch (err) {
            console.error(
                "WSL not available. Please install WSL and setup a Linux distro.",
            );
            throw err;
        }

        // Convert Windows absolute path like C:\\x\\y to /mnt/c/x/y
        const wslScriptPath = `/mnt/${scriptPath[0]?.toLowerCase()}${scriptPath
            .slice(2)
            .replace(/\\/g, "/")
            .replace(/^\/?/, "/")}`;
        await run("wsl", ["bash", wslScriptPath]);
        return;
    }

    console.error(`Unsupported platform: ${plt}`);
    process.exit(1);
}

main().catch((err: unknown) => {
    if (err instanceof Error) console.error(err.message);
    else console.error(err);
    process.exit(1);
});
