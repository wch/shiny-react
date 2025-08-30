import * as esbuild from "esbuild";
import * as fs from "fs";
import { spawn } from "child_process";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const metafile = process.argv.includes("--metafile");

const esbuildProblemMatcherPlugin: esbuild.Plugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    const entryPoints = build.initialOptions.entryPoints;
    if (entryPoints === undefined || entryPoints.length === 0) {
      throw new Error("entryPoints is undefined");
    }

    // Get the input file names
    let entryPointsInputNames: string[];
    if (Array.isArray(entryPoints)) {
      // Case 1: Array of strings or {in, out} objects
      entryPointsInputNames = entryPoints.map((e) => {
        if (typeof e === "string") {
          return e;
        } else {
          return e.in;
        }
      });
    } else {
      // Case 2: Entire object is Record<string, string>
      const record = entryPoints;
      entryPointsInputNames = Object.values(record);
    }

    build.onStart(() => {
      console.log(
        `[${watch ? "watch " : ""}${new Date().toISOString()}] build started ${entryPointsInputNames.join(
          ", "
        )}`
      );
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location !== null) {
          console.error(
            `    ${location.file}:${location.line}:${location.column}:`
          );
        }
      });
      console.log(
        `[${watch ? "watch " : ""}${new Date().toISOString()}] build finished ${entryPointsInputNames.join(
          ", "
        )}`
      );
    });
  },
};

const metafilePlugin: esbuild.Plugin = {
  name: "metafile",
  setup(build) {
    build.onEnd((result) => {
      if (result.metafile) {
        // For each output in the metafile
        Object.entries(result.metafile.outputs).forEach(
          ([outputPath, output]) => {
            // Get the entry point for this output
            const entryPoint = output.entryPoint;
            if (entryPoint) {
              // Extract filename without extension
              const bundleName = entryPoint
                .replace(/^.*[\\/]/, "")
                .replace(/\.[^/.]+$/, "");

              fs.writeFileSync(
                `${bundleName}.esbuild-meta.json`,
                JSON.stringify(result.metafile)
              );
            }
          }
        );
      }
    });
  },
};

function runTypeScript(watchMode = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ["--emitDeclarationOnly"];
    if (watchMode) {
      args.push("--watch");
    }

    const tsc = spawn("npx", ["tsc", ...args], {
      stdio: "inherit",
      shell: true,
    });

    if (!watchMode) {
      tsc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TypeScript compilation failed with code ${code}`));
        }
      });
    } else {
      // In watch mode, don't wait for close
      resolve();
    }

    tsc.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  const buildmap = {
    // Bundled ESM for Node.js environments
    esm: esbuild.context({
      entryPoints: ["src/index.ts"],
      outfile: "dist/index.mjs",
      bundle: true,
      format: "esm",
      minify: production,
      sourcemap: "linked",
      sourcesContent: true,
      external: ["react", "react-dom"],
      logLevel: "silent",
      metafile: metafile,
      plugins: [metafilePlugin, esbuildProblemMatcherPlugin],
    }),
    // Unbundled ESM for bundlers (better tree-shaking)
    esmModule: esbuild.context({
      entryPoints: ["src/index.ts", "src/use-shiny.ts", "src/ImageOutput.tsx", "src/utils.ts"],
      outdir: "dist",  // Use outdir instead of outfile for multiple files
      bundle: false,  // Don't bundle - let downstream bundlers handle it
      format: "esm",
      minify: false,  // Don't minify - let downstream bundlers handle it
      sourcemap: "linked",
      sourcesContent: true,
      // Note: external is not needed with bundle: false
      logLevel: "silent",
      metafile: metafile,
      plugins: [metafilePlugin, esbuildProblemMatcherPlugin],
    }),
    // CJS for older Node.js environments
    cjs: esbuild.context({
      entryPoints: ["src/index.ts"],
      outfile: "dist/index.cjs",
      bundle: true,
      format: "cjs",
      minify: production,
      sourcemap: "linked",
      sourcesContent: true,
      external: ["react", "react-dom"],
      logLevel: "silent",
      metafile: metafile,
      plugins: [metafilePlugin, esbuildProblemMatcherPlugin],
    }),
  };

  // Start TypeScript compilation for declarations
  if (watch) {
    console.log("Starting TypeScript compiler in watch mode...");
    runTypeScript(true).catch((e) => {
      console.error("TypeScript watch failed:", e);
    });
  } else {
    console.log("Running TypeScript compiler for declarations...");
    try {
      await runTypeScript(false);
      console.log("TypeScript declarations generated successfully");
    } catch (e) {
      console.error("TypeScript compilation failed:", e);
      process.exit(1);
    }
  }

  // Start esbuild
  Object.values(buildmap).forEach((build) =>
    build
      .then(async (context) => {
        if (watch) {
          await context.watch();
        } else {
          await context.rebuild();
          await context.dispose();
        }
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
