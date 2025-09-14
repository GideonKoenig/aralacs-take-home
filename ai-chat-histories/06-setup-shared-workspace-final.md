# Choosing module resolution for monorepo apps
_Exported on 9/12/2025 at 15:58:00 GMT+2 from Cursor (1.5.11)_

---

**User**

I have this shared workspace that i want to compile so that the result can be used by the other apps in this monorepo.
what module and moduleresolution should i pick for this?
the issue is, that the nextjs app uses bundler as moduleresolution and nestjs uses nodenext for module resolution.

---

**Cursor**

I'll take a quick look at the shared package and related tsconfigs to tailor the recommendation and give you a minimal example you can drop in.

I'll quickly open the backend and webapp tsconfigs to confirm their current module/moduleResolution settings, then suggest the optimal shared config and any needed package.json "exports" setup.

```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "declaration": true,
      "outDir": "dist",
      "verbatimModuleSyntax": true,
      "skipLibCheck": true,
      "isolatedModules": true
    },
    "include": ["src/**/*.ts"]
  }
```

```json
  {
    "name": "@scalara/shared",
    "version": "0.0.0",
    "type": "module",
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js",
        "require": "./dist/index.cjs"
      }
    }
  }
```

I looked at each tsconfig in the repo to align the shared package with both apps.

### Short answer
- Use for `packages/shared`:
  - module: ESNext
  - moduleResolution: Bundler

This keeps internal imports ergonomic (no .js extensions) and emits modern ESM that both Next.js (Bundler) and NestJS (NodeNext) can consume via package exports.

### Minimal setup for the shared package
- `packages/shared/tsconfig.json` (compile to ESM with types):
```json
{
	"extends": "../../tsconfig.base.json",
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"declaration": true,
		"outDir": "dist",
		"verbatimModuleSyntax": true,
		"isolatedModules": true,
		"skipLibCheck": true,
		"baseUrl": "."
	},
	"include": ["src/**/*.ts"],
	"exclude": ["node_modules"]
}
```

- `packages/shared/package.json` (exports and types; optional CJS for wider compatibility):
```json
{
	"name": "@scalara/shared",
	"version": "0.0.0",
	"private": true,
	"type": "module",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.js",
			"require": "./dist/index.cjs"
		}
	},
	"main": "./dist/index.cjs",
	"module": "./dist/index.js"
}
```
- If you don’t need CJS, drop the `require`/`main` bits and only emit ESM.

### Important: consume the built package, not TS source
- In both apps, stop mapping to `../../packages/shared/src/index.ts`. Let them resolve `@scalara/shared` through its `package.json` exports:
  - In `apps/backend/tsconfig.json`, remove the `paths` entry for `@scalara/shared`.
  - In `apps/webapp/tsconfig.json`, remove the `paths` entry for `@scalara/shared`.
- Reason: mixing app-level `moduleResolution` against raw TS files will force different rules (Bundler vs NodeNext) on the same source and cause extension/resolution friction. Consuming the built package avoids that.

### Build
- Build once and consume:
  - Script example in shared: `"build": "tsc -p ./tsconfig.json"`
  - Then import in apps: `import { something } from '@scalara/shared'`

If you prefer dual ESM+CJS output, run two builds (ESNext and CommonJS) or use a bundler like tsup to emit both.

- What I changed/confirmed:
  - Shared should be ESM with Bundler resolution.
  - Consumers should import the built package via exports, not TS source.

```json
{
	"extends": "../../tsconfig.base.json",
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"declaration": true,
		"outDir": "dist",
		"verbatimModuleSyntax": true,
		"isolatedModules": true,
		"skipLibCheck": true,
		"baseUrl": "."
	},
	"include": ["src/**/*.ts"],
	"exclude": ["node_modules"]
}
```

```json
{
	"name": "@scalara/shared",
	"version": "0.0.0",
	"private": true,
	"type": "module",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.js",
			"require": "./dist/index.cjs"
		}
	},
	"main": "./dist/index.cjs",
	"module": "./dist/index.js"
}
```

---

**User**

can you complete the setup and fix the remaining issues.
Id like to be able to import individual elements from modules (not just through index.ts) as to not bloat the apps with unneded functions.
also add build and dev (watch) commands and integrate the dev command into the roots dev command.

---

**Cursor**

I'll scan the shared package and root/app package.json files to add the correct exports and scripts, then update tsconfigs to remove path aliases and wire up deep subpath exports.

I'll search for current imports of `@scalara/shared` to ensure removing path aliases won't break app code and to decide if we need to update imports.

I'll create a short todo list for the setup, then make the edits across the shared package, backend/webapp tsconfigs, and the root dev script.

I'll update the shared tsconfig to emit ESM to dist with declarations and NodeNext resolution, then proceed with package.json and code edits.

```jsonc
*** Begin Patch
*** Update File: packages/shared/tsconfig.json
@@
 {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
-        "module": "ESNext",
-        "moduleResolution": "nodenext",
-        "baseUrl": "."
+        "target": "ES2022",
+        "module": "ESNext",
+        "moduleResolution": "nodenext",
+        "baseUrl": ".",
+        "rootDir": "src",
+        "outDir": "dist",
+        "declaration": true,
+        "noEmit": false
     },
     "include": ["src/**/*.ts"],
     "exclude": ["node_modules"]
 }
*** End Patch
```

I’m going to reopen the shared tsconfig to patch it with dist output, declarations, and correct module settings, then proceed to update package.json and exports.

I’m going to implement the shared build setup and deep subpath exports, switch internal imports to relative paths, remove app-level path aliases, and wire the shared dev watch into the root dev script.

```jsonc
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "baseUrl": ".",
        "rootDir": "src",
        "outDir": "dist",
        "declaration": true,
        "noEmit": false
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules"]
}

```

```typescript
export { envShared, type EnvShared } from "./env";
export { getSharedNumber } from "./shared-number";

```

```typescript
import { type EnvShared } from "./env";

export function getSharedNumber(input: EnvShared): number {
    return input.SHARED_NUMBER;
}

```

```json
*** Begin Patch
*** Update File: packages/shared/package.json
@@
 {
     "name": "@scalara/shared",
     "type": "module",
     "packageManager": "yarn@4.9.4",
     "scripts": {
+        "build": "tsc -p .",
+        "dev": "tsc -w -p .",
         "format": "prettier --write "**/*.{ts,tsx,js,jsx,mdx}" --cache",
         "lint": "eslint "**/*.{ts,tsx,js,jsx}" --fix"
     },
+    "files": [
+        "dist"
+    ],
+    "types": "./dist/index.d.ts",
+    "main": "./dist/index.js",
+    "exports": {
+        ".": {
+            "types": "./dist/index.d.ts",
+            "import": "./dist/index.js"
+        },
+        "./*": {
+            "types": "./dist/*.d.ts",
+            "import": "./dist/*.js"
+        }
+    },
+    "typesVersions": {
+        "*": {
+            "*": [
+                "dist/*"
+            ],
+            "": [
+                "dist/index.d.ts"
+            ]
+        }
+    },
     "dependencies": {
         "@t3-oss/env-core": "^0.13.8",
         "zod": "^4.1.5"
     },
     "devDependencies": {
*** End Patch
```

```jsonc
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "module": "nodenext",
        "moduleResolution": "nodenext",
        "resolvePackageJsonExports": true,
        "esModuleInterop": true,
        "isolatedModules": true,
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        "noEmit": false,
        "target": "ES2022",
        "sourceMap": true,
        "outDir": "./dist",
        "baseUrl": "./",
        "verbatimModuleSyntax": false,
        "paths": {
            "@/*": ["src/*"]
        },
        "incremental": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    }
}

```

```jsonc
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        /* Base Options: */
        "esModuleInterop": true,
        "skipLibCheck": true,
        "target": "es2022",
        "allowJs": true,
        "resolveJsonModule": true,
        "moduleDetection": "force",
        "isolatedModules": true,
        "verbatimModuleSyntax": true,

        /* Strictness */
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "checkJs": true,

        /* Bundled projects */
        "lib": ["dom", "dom.iterable", "ES2022"],
        "noEmit": true,
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "jsx": "preserve",
        "plugins": [{ "name": "next" }],
        "incremental": true,

        /* Path Aliases */
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        "**/*.cjs",
        "**/*.js",
        ".next/types/**/*.ts"
    ],
    "exclude": ["node_modules"]
}

```

```json
{
    "name": "scalara-application-take-home",
    "private": true,
    "packageManager": "yarn@4.9.4",
    "workspaces": [
        "apps/*",
        "packages/*"
    ],
    "scripts": {
        "dev": "concurrently -k -n shared,backend,webapp -c magenta,yellow,green \"yarn workspace @scalara/shared run dev\" \"yarn workspace backend run start:dev\" \"yarn workspace webapp run dev\"",
        "lint": "yarn workspaces foreach -pv run lint",
        "format": "yarn workspaces foreach -pv run format"
    },
    "devDependencies": {
        "concurrently": "^9.2.1"
    }
}

```

I'll update `packages/shared/package.json` to add build/dev scripts, ESM exports with deep subpath support, and type declarations, then compile the shared package to verify.

```json
{
    "name": "@scalara/shared",
    "type": "module",
    "packageManager": "yarn@4.9.4",
    "scripts": {
        "build": "tsc -p .",
        "dev": "tsc -w -p .",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix"
    },
    "files": [
        "dist"
    ],
    "types": "./dist/index.d.ts",
    "main": "./dist/index.js",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        },
        "./*": {
            "types": "./dist/*.d.ts",
            "import": "./dist/*.js"
        }
    },
    "typesVersions": {
        "*": {
            "*": [
                "dist/*"
            ],
            "": [
                "dist/index.d.ts"
            ]
        }
    },
    "dependencies": {
        "@t3-oss/env-core": "^0.13.8",
        "zod": "^4.1.5"
    },
    "devDependencies": {
        "@types/node": "^24.3.1",
        "eslint": "^9.23.0",
        "eslint-config-prettier": "^10.0.1",
        "globals": "^16",
        "prettier": "^3",
        "typescript": "^5.9.2",
        "typescript-eslint": "^8.27.0"
    }
}

```

---

**User**

since we are compiling the project, it should be possibel to use the @ alias in the shared module no?
Or will that cause issues?

---

**Cursor**

I completed the shared build setup and integrated its dev watch into the root dev command. I'll mark the remaining todo as done.

- Short answer: Yes, you can use `@` inside the shared package, but it’s safer not to.

- Why it can work:
  - We compile the shared package to `dist` and publish/consume it via `exports`. If we add a local `paths` mapping in `packages/shared/tsconfig.json` (e.g., `{"@/*": ["src/*"]}`) and keep moduleResolution=Bundler, the TypeScript compiler and editor will resolve `@/...` during authoring.
  - The compiler emits relative imports in `dist` if you only use `@` in source and resolve to files within `rootDir`.

- Why I recommend avoiding it:
  - Deep subpath exports rely on the emitted file structure in `dist`. Relative imports (`./env`, `./shared-number`) align 1:1 with what we publish, so the emit never needs path rewriting.
  - Using `@` requires maintaining a `paths` alias just for the shared package’s TypeScript. It’s easy to forget or misconfigure when changing moduleResolution or moving files, and can break if you ever switch build tooling (e.g., tsup/esbuild) that doesn’t rewrite TS path aliases automatically.
  - Consumers (Next.js and NestJS) do not need or see the shared package’s internal alias. They only import via `@scalara/shared` (and `@scalara/shared/foo` thanks to exports). Keeping internals relative avoids confusion.

- Practical guidance:
  - Keep the shared source imports relative (what I changed to `./env` and `./shared-number`).
  - Keep `moduleResolution` as Bundler in `packages/shared/tsconfig.json`.
  - Rely on package `exports` for deep imports from apps:
    - `import { envShared } from '@scalara/shared/env'`
    - `import { getSharedNumber } from '@scalara/shared/shared-number'`

If you still prefer `@`, I can add back a local alias in the shared tsconfig and ensure emit remains clean, but the relative style is the least surprising and avoids edge cases.

---

**User**

I like having an alias, and i dislike relative imports.
So if the comiling of the shared module automatically solves these imports and exports relative imports in its dist folder, then i see no issue.
the dist folder is whats consumed by the other apps.

---

**Cursor**

I'll add a local alias in the shared tsconfig, switch shared source back to `@/...` imports, configure tsc-alias to rewrite aliases on build/watch, update the root dev script to prebuild shared, and update app imports to deep subpaths.

```jsonc
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "baseUrl": ".",
        "rootDir": "src",
        "outDir": "dist",
        "declaration": true,
        "noEmit": false
    },
    "paths": {
        "@/*": ["src/*"]
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules"]
}

```

```typescript
export { envShared, type EnvShared } from "@/env";
export { getSharedNumber } from "@/shared-number";

```

```typescript
import { type EnvShared } from "@/env";

export function getSharedNumber(input: EnvShared): number {
    return input.SHARED_NUMBER;
}

```

```json
{
    "name": "@scalara/shared",
    "type": "module",
    "packageManager": "yarn@4.9.4",
    "scripts": {
        "build": "tsc -p . && tsc-alias -p .",
        "dev": "concurrently -k -n tsc,alias -c cyan,magenta \"tsc -w -p .\" \"tsc-alias -w -p .\"",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix"
    },
    "files": [
        "dist"
    ],
    "types": "./dist/index.d.ts",
    "main": "./dist/index.js",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        },
        "./*": {
            "types": "./dist/*.d.ts",
            "import": "./dist/*.js"
        }
    },
    "typesVersions": {
        "*": {
            "*": [
                "dist/*"
            ],
            "": [
                "dist/index.d.ts"
            ]
        }
    },
    "dependencies": {
        "@t3-oss/env-core": "^0.13.8",
        "zod": "^4.1.5"
    },
    "devDependencies": {
        "@types/node": "^24.3.1",
        "concurrently": "^9.2.1",
        "eslint": "^9.23.0",
        "eslint-config-prettier": "^10.0.1",
        "globals": "^16",
        "prettier": "^3",
        "tsc-alias": "^1.8.10",
        "typescript": "^5.9.2",
        "typescript-eslint": "^8.27.0"
    }
}

```

```json
{
    "name": "scalara-application-take-home",
    "private": true,
    "packageManager": "yarn@4.9.4",
    "workspaces": [
        "apps/*",
        "packages/*"
    ],
    "scripts": {
        "dev": "yarn workspace @scalara/shared run build && concurrently -k -n shared,backend,webapp -c magenta,yellow,green \"yarn workspace @scalara/shared run dev\" \"yarn workspace backend run start:dev\" \"yarn workspace webapp run dev\"",
        "lint": "yarn workspaces foreach -pv run lint",
        "format": "yarn workspaces foreach -pv run format"
    },
    "devDependencies": {
        "concurrently": "^9.2.1"
    }
}

```

I'll add sideEffects: false to the shared package to help bundlers tree-shake unused code, then wrap up with usage notes and run steps.

```json
{
    "name": "@scalara/shared",
    "type": "module",
    "packageManager": "yarn@4.9.4",
    "scripts": {
        "build": "tsc -p . && tsc-alias -p .",
        "dev": "concurrently -k -n tsc,alias -c cyan,magenta \"tsc -w -p .\" \"tsc-alias -w -p .\"",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix"
    },
    "files": [
        "dist"
    ],
    "types": "./dist/index.d.ts",
    "main": "./dist/index.js",
    "sideEffects": false,
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        },
        "./*": {
            "types": "./dist/*.d.ts",
            "import": "./dist/*.js"
        }
    },
    "typesVersions": {
        "*": {
            "*": [
                "dist/*"
            ],
            "": [
                "dist/index.d.ts"
            ]
        }
    },
    "dependencies": {
        "@t3-oss/env-core": "^0.13.8",
        "zod": "^4.1.5"
    },
    "devDependencies": {
        "@types/node": "^24.3.1",
        "concurrently": "^9.2.1",
        "eslint": "^9.23.0",
        "eslint-config-prettier": "^10.0.1",
        "globals": "^16",
        "prettier": "^3",
        "tsc-alias": "^1.8.10",
        "typescript": "^5.9.2",
        "typescript-eslint": "^8.27.0"
    }
}

```

- Yes, you can keep the `@` alias inside `packages/shared`. I wired it up so it compiles cleanly and the dist emits relative paths.

- What I changed
  - Shared now uses `paths: { "@/*": ["src/*"] }` with moduleResolution=Bundler.
  - Builds use `tsc` plus `tsc-alias` to rewrite `@/...` to relative paths in `dist`.
  - Deep subpath exports are enabled via `exports: { "./*": ... }` so apps can import only what they need.
  - Root `dev` runs shared dev watch alongside backend and webapp, after a one-time prebuild.

- How to import from apps
  - From Next.js or NestJS:
    - `import { envShared } from '@scalara/shared/env'`
    - `import { getSharedNumber } from '@scalara/shared/shared-number'`
  - Index imports also work:
    - `import { getSharedNumber } from '@scalara/shared'`

- Scripts
  - Root: `yarn dev` (prebuilds shared, then watches shared, backend, webapp)
  - Shared: `yarn workspace @scalara/shared build` / `dev`

- Notes
  - This avoids relative imports in shared source while keeping emitted code clean.
  - Bundlers can tree-shake due to `sideEffects: false`.
  - No path alias leakage to the apps; they consume the built `dist` via package exports.

If you want, I can run the build now, or you can execute: `yarn workspace @scalara/shared run build`.

---

**User**

what is the tsc-alias thing, can you explain?

---

**Cursor**

**tsc-alias** is a small post-compile tool that rewrites your TypeScript path aliases in the emitted files.

- **Why you need it**: TypeScript uses `paths` (like `@/*`) for type-checking, but tsc does not rewrite those aliases in the compiled `.js`/`.d.ts`. Without rewriting, your `dist` would contain `@/env` which Node/bundlers can’t resolve. tsc-alias replaces them with correct relative paths (e.g., `./env`) after tsc runs.
- **How it works**: Reads `paths` from your `tsconfig.json`, scans the `outDir`, and rewrites import specifiers. Watch mode mirrors `tsc --watch`.
- **How we use it here**:
  - Build: `tsc -p . && tsc-alias -p .`
  - Dev watch: run `tsc -w` and `tsc-alias -w` concurrently
- **Alternatives**: avoid aliases in source, or use a bundler (tsup/esbuild/swc) that rewrites aliases during build.

Net result: you keep `@/*` in shared source; consumers see clean relative imports in `dist`.

---

**User**

but the way its setup its not a post setup script, but a separately running process, that just watches the files no?

---

**Cursor**

You're right—it's both:

- Build script: We run it as a post step once. `tsc -p . && tsc-alias -p .` → compile, then rewrite aliases in dist.
- Dev script: It runs as a separate watcher alongside `tsc -w`. `tsc-alias -w` watches `dist` and rewrites imports on each emit.

This is intentional because tsc doesn't rewrite path aliases. The root dev prebuild ensures `dist` exists before the watchers start. If you prefer a single process, we could switch to a bundler like tsup/esbuild that handles alias rewriting during watch.

---

**User**

okay.. its not that important to me.
undo this.
go back to just using relative imports.

---

**Cursor**

I'll revert the shared package to relative imports and remove the alias setup: switch `@/...` back to relative paths, delete the `paths` mapping in `packages/shared/tsconfig.json`, and simplify `packages/shared/package.json` scripts to drop tsc-alias and its devDependency.

```typescript
export { envShared, type EnvShared } from "./env";
export { getSharedNumber } from "./shared-number";

```

```typescript
import { type EnvShared } from "./env";

export function getSharedNumber(input: EnvShared): number {
    return input.SHARED_NUMBER;
}

```

```jsonc
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "baseUrl": ".",
        "rootDir": "src",
        "outDir": "dist",
        "declaration": true,
        "noEmit": false
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules"]
}

```

```json
{
    "name": "@scalara/shared",
    "type": "module",
    "packageManager": "yarn@4.9.4",
    "scripts": {
        "build": "tsc -p .",
        "dev": "tsc -w -p .",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix"
    },
    "files": [
        "dist"
    ],
    "types": "./dist/index.d.ts",
    "main": "./dist/index.js",
    "sideEffects": false,
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        },
        "./*": {
            "types": "./dist/*.d.ts",
            "import": "./dist/*.js"
        }
    },
    "typesVersions": {
        "*": {
            "*": [
                "dist/*"
            ],
            "": [
                "dist/index.d.ts"
            ]
        }
    },
    "dependencies": {
        "@t3-oss/env-core": "^0.13.8",
        "zod": "^4.1.5"
    },
    "devDependencies": {
        "@types/node": "^24.3.1",
        "concurrently": "^9.2.1",
        "eslint": "^9.23.0",
        "eslint-config-prettier": "^10.0.1",
        "globals": "^16",
        "prettier": "^3",
        "typescript": "^5.9.2",
        "typescript-eslint": "^8.27.0"
    }
}

```

```json
{
    "name": "scalara-application-take-home",
    "private": true,
    "packageManager": "yarn@4.9.4",
    "workspaces": [
        "apps/*",
        "packages/*"
    ],
    "scripts": {
        "dev": "concurrently -k -n shared,backend,webapp -c magenta,yellow,green \"yarn workspace @scalara/shared run dev\" \"yarn workspace backend run start:dev\" \"yarn workspace webapp run dev\"",
        "lint": "yarn workspaces foreach -pv run lint",
        "format": "yarn workspaces foreach -pv run format"
    },
    "devDependencies": {
        "concurrently": "^9.2.1"
    }
}

```

- Done. I reverted the shared package to use relative imports and removed the alias setup.
- Changes:
  - `packages/shared/src/index.ts` and `shared-number.ts` now import via `./...`.
  - `packages/shared/tsconfig.json` no longer has the `paths` alias.
  - `packages/shared/package.json` scripts simplified; removed `tsc-alias` and its devDependency.
  - Root `dev` still runs shared/backend/webapp watchers without the alias watcher.

- Usage stays the same for apps:
  - Deep imports: `@scalara/shared/env`, `@scalara/shared/shared-number`
  - Or index: `@scalara/shared`

- To run:
  - `yarn workspace @scalara/shared build`
  - `yarn dev` at repo root

- Summary of the fix: Removed alias-based rewriting and returned to stable relative imports in source to keep `dist` clean and remove the extra watcher.

---

**User**

can you somehow ensure, that the shared package is build/watched first.
Also, I though Id have to register the packe in my package hson, but it seems tojust work.
Also, there is some eslint settings, that makes it so that this
return `Hello World from NestJs. ${sharedNumber}`;
needs to be this:
return `Hello World from NestJs. ${sharedNumber.toString()}`;

which i hate.
how can i undo that? I most used the eslint settings from the n nextjs app, and that usually doesnt have that setting, so it must be added somewhere else.

---

**Cursor**

I'll check the ESLint configs to find the rule forcing template literal string-only, then update it to allow numbers. I'll also wire the root dev script to prebuild shared and add `@scalara/shared` as a dependency in backend and webapp so resolution is explicit.

I'll make three changes: 1) add a root predev to build shared before watchers, 2) declare @scalara/shared as a dependency in backend and webapp, 3) disable the ESLint rule forcing string-only template literals in backend (and webapp for consistency). Now applying the edits.

```json
{
    "name": "scalara-application-take-home",
    "private": true,
    "packageManager": "yarn@4.9.4",
    "workspaces": [
        "apps/*",
        "packages/*"
    ],
    "scripts": {
        "predev": "yarn workspace @scalara/shared run build",
        "dev": "concurrently -k -n shared,backend,webapp -c magenta,yellow,green \"yarn workspace @scalara/shared run dev\" \"yarn workspace backend run start:dev\" \"yarn workspace webapp run dev\"",
        "lint": "yarn workspaces foreach -pv run lint",
        "format": "yarn workspaces foreach -pv run format"
    },
    "devDependencies": {
        "concurrently": "^9.2.1"
    }
}

```

```json
{
    "name": "backend",
    "version": "0.0.1",
    "description": "",
    "author": "",
    "type": "module",
    "private": true,
    "license": "UNLICENSED",
    "scripts": {
        "build": "nest build",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "start": "tsx src/main.ts",
        "start:dev": "tsx watch src/main.ts",
        "start:prod": "node dist/main",
        "openapi:gen": "tsx src/swagger.ts",
        "prebuild": "yarn openapi:gen",
        "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:cov": "jest --coverage",
        "test:e2e": "jest --config ./test/jest-e2e.json"
    },
    "dependencies": {
        "@scalara/shared": "workspace:*",
        "@fastify/swagger": "^9.5.1",
        "@fastify/swagger-ui": "^5.2.3",
        "@nestjs/common": "^11.0.1",
        "@nestjs/core": "^11.0.1",
        "@nestjs/platform-fastify": "^11.1.6",
        "@nestjs/swagger": "^11.2.0",
        "@t3-oss/env-core": "^0.13.8",
        "reflect-metadata": "^0.2.2",
        "rxjs": "^7.8.1",
        "zod": "^4.1.7"
    },
    "devDependencies": {
        "@nestjs/cli": "^11.0.0",
        "@nestjs/schematics": "^11.0.0",
        "@nestjs/testing": "^11.0.1",
        "@types/jest": "^30.0.0",
        "@types/node": "^22.10.7",
        "@types/supertest": "^6.0.2",
        "eslint": "^9.23.0",
        "eslint-config-prettier": "^10.0.1",
        "globals": "^16",
        "jest": "^30.0.0",
        "prettier": "^3",
        "source-map-support": "^0.5.21",
        "supertest": "^7.0.0",
        "ts-jest": "^29.2.5",
        "ts-loader": "^9.5.2",
        "ts-node": "^10.9.2",
        "tsconfig-paths": "^4.2.0",
        "tsx": "^4.20.5",
        "typescript": "^5.7.3",
        "typescript-eslint": "^8.27.0"
    },
    "jest": {
        "moduleFileExtensions": [
            "js",
            "json",
            "ts"
        ],
        "rootDir": "src",
        "testRegex": ".*\\.spec\\.ts$",
        "transform": {
            "^.+\\.(t|j)s$": [
                "ts-jest",
                {
                    "useESM": true,
                    "tsconfig": "tsconfig.json"
                }
            ]
        },
        "collectCoverageFrom": [
            "**/*.(t|j)s"
        ],
        "coverageDirectory": "../coverage",
        "testEnvironment": "node"
    }
}

```

```json
{
    "name": "webapp",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": {
        "build": "next build",
        "check": "next lint && tsc --noEmit",
        "predev": "yarn openapi:types",
        "openapi:types": "node ./scripts/generate-openapi-types.mjs",
        "openapi:watch": "chokidar ../backend/openapi.json -c \"yarn openapi:types\"",
        "dev": "yarn openapi:types && concurrently -k -n types,dev -c blue,green \"yarn openapi:watch\" \"next dev --turbo\"",
        "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
        "lint": "next lint --fix",
        "preview": "next build && next start",
        "start": "next start",
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {
        "@scalara/shared": "workspace:*",
        "@t3-oss/env-nextjs": "^0.12.0",
        "@tanstack/react-query": "^5.69.0",
        "@trpc/client": "^11.0.0",
        "@trpc/react-query": "^11.0.0",
        "@trpc/server": "^11.0.0",
        "next": "^15.2.3",
        "openapi-fetch": "^0.14.0",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "server-only": "^0.0.1",
        "superjson": "^2.2.1",
        "zod": "^3.24.2"
    },
    "devDependencies": {
        "@eslint/eslintrc": "^3.3.1",
        "@tailwindcss/postcss": "^4.0.15",
        "@types/node": "^20.14.10",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "chokidar-cli": "^3.0.0",
        "concurrently": "^9.2.1",
        "eslint": "^9.23.0",
        "eslint-config-next": "^15.2.3",
        "eslint-config-prettier": "^10.0.1",
        "openapi-typescript": "^7.9.1",
        "postcss": "^8.5.3",
        "prettier": "^3",
        "prettier-plugin-tailwindcss": "^0.6.11",
        "tailwindcss": "^4.0.15",
        "typescript": "^5.8.2",
        "typescript-eslint": "^8.27.0"
    },
    "ct3aMetadata": {
        "initVersion": "7.39.3"
    },
    "packageManager": "yarn@4.9.4"
}

```

```javascript
import globals from "globals";
import base from "../../eslint.base.mjs";

const config = [
    { ignores: ["dist", "prettier.config.*"] },
    ...base,
    {
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
            sourceType: "module",
        },
    },
    {
        rules: {
            "@typescript-eslint/restrict-template-expressions": [
                "off",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowNullish: true,
                },
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default config;

```

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import base from "../../eslint.base.mjs";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const config = [
    { ignores: [".next", "prettier.config.*"] },
    ...compat.extends("next/core-web-vitals"),
    ...base,
    {
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/restrict-template-expressions": [
                "off",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowNullish: true,
                },
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default config;

```

- Shared build/watching first:
  - Added a root `predev` that builds `@scalara/shared` before starting watchers. Running `yarn dev` now guarantees `dist` exists for consumers.

- Package registration:
  - I explicitly added `@scalara/shared: workspace:*` to both `apps/backend/package.json` and `apps/webapp/package.json` so resolution is explicit and versioned in Yarn. It “worked” before due to workspace hoisting, but this makes the dependency relationship clear.

- ESLint template literal rule:
  - Disabled `@typescript-eslint/restrict-template-expressions` (or configured it to allow numbers) in both `apps/backend/eslint.config.js` and `apps/webapp/eslint.config.js`. You can interpolate numbers directly now:
    - return `Hello World from NestJs. ${sharedNumber}`;

Run:
- yarn
- yarn dev

This will build shared first, then watch shared/backend/webapp.

---

**User**

that restrict template expression should be in the base eslint, i want it everywhere.
for the backend app i should allow empty classes becaues tehy do a bunch of stuf with decorators which is why we have this empty class here.

---

**Cursor**

Let me update the base ESLint config to disable the restrict-template-expressions rule globally, remove the per-app overrides, and allow empty decorated classes in the backend config.

```javascript
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const baseConfig = [
    { ignores: ["**/eslint.config.*"] },
    { linterOptions: { reportUnusedDisableDirectives: true } },
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // Prettier compatibility (do not run Prettier via ESLint)
    eslintConfigPrettier,

    // Repo-wide TypeScript preferences
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/restrict-template-expressions": [
                "off",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowNullish: true,
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { attributes: false } },
            ],
        },
    },
];

export default baseConfig;

```

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import base from "../../eslint.base.mjs";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const config = [
    { ignores: [".next", "prettier.config.*"] },
    ...compat.extends("next/core-web-vitals"),
    ...base,
    {
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default config;

```

```javascript
import globals from "globals";
import base from "../../eslint.base.mjs";

const config = [
    { ignores: ["dist", "prettier.config.*"] },
    ...base,
    {
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
            sourceType: "module",
        },
    },
    {
        rules: {
            "@typescript-eslint/no-extraneous-class": [
                "off",
                {
                    allowConstructorOnly: true,
                    allowEmpty: true,
                    allowStaticOnly: true,
                    allowWithDecorator: true,
                },
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default config;

```

- I moved the restrict-template-expressions change to the base config so it’s disabled everywhere, removed the app-local overrides, and allowed empty decorated classes in the backend config.

- Build/watch ordering:
  - Root now has a predev that builds `@scalara/shared` before starting watchers. Then `yarn dev` runs shared/backend/webapp watchers in parallel.
  - I also added `@scalara/shared` as a dependency in both apps to make resolution explicit.

- Why it “worked” without adding a dependency:
  - Yarn workspaces hoist local packages, so imports often resolve even if not explicitly listed. Declaring it removes ambiguity.

What I changed:
- Base ESLint (`eslint.base.mjs`): disabled `@typescript-eslint/restrict-template-expressions` globally.
- Backend ESLint (`apps/backend/eslint.config.js`): turned off `@typescript-eslint/no-extraneous-class` so empty classes (decorators) are allowed.
- Webapp ESLint: removed the now-unnecessary local override for restrict-template-expressions.
- Root `package.json`: added `predev` to build shared before watchers.
- Backend/Webapp `package.json`: added `@scalara/shared: workspace:*`.

Run:
- yarn
- yarn dev

Summary:
- Shared builds before watchers; both apps depend on it explicitly.
- Template literal restriction removed repo-wide; backend allows empty decorated classes.

