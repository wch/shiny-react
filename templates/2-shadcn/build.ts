import chokidar from "chokidar";
import * as esbuild from "esbuild";
import tailwindPlugin from "esbuild-plugin-tailwindcss";
import { existsSync } from "node:fs";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const metafile = process.argv.includes("--metafile");

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ["srcts/main.tsx"],
  bundle: true,
  format: "esm",
  minify: production,
  sourcemap: production ? undefined : "linked",
  sourcesContent: true,
  alias: {
    react: "react",
  },
  logLevel: "info",
  metafile: metafile,
  plugins: [tailwindPlugin()],
};

async function main() {
  const buildmap: Record<string, Promise<esbuild.BuildContext>> = {};

  // Only add build context if the directory exists
  if (existsSync("r")) {
    buildmap.r = esbuild.context({
      ...buildOptions,
      outfile: "r/www/main.js",
    });
  }

  if (existsSync("py")) {
    buildmap.py = esbuild.context({
      ...buildOptions,
      outfile: "py/www/main.js",
    });

    if (Object.keys(buildmap).length === 0) {
      console.log("No build targets found. Need r/ or py/ directory. Exiting.");
      process.exit(0);
    }
  }

  if (watch) {
    // Use chokidar for watching instead of esbuild's watch, because esbuild's
    // watch mode constantly consumes 15-25% CPU due to polling.
    // https://github.com/evanw/esbuild/issues/1527
    const contexts = await Promise.all(Object.values(buildmap));

    // Initial build
    await Promise.all(contexts.map((context) => context.rebuild()));

    const watchPaths = ["srcts/", "tailwind.config.js"];

    const watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
    });

    let rebuildTimeout: NodeJS.Timeout;

    watcher.on("all", (eventName, path) => {
      console.log(`${eventName}: ${path}`);

      // Debounce rebuilds to avoid rapid successive builds
      clearTimeout(rebuildTimeout);
      rebuildTimeout = setTimeout(async () => {
        try {
          await Promise.all(contexts.map((context) => context.rebuild()));
        } catch (error) {
          console.error("Rebuild failed:", error);
        }
      }, 100);
    });

    watcher.on("error", (error) => {
      console.error("Watcher error:", error);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nShutting down...");

      // Close file watcher
      await watcher.close();

      // Dispose esbuild contexts
      await Promise.all(contexts.map((context) => context.dispose()));

      process.exit(0);
    });
  } else {
    // Non-watch build
    Object.entries(buildmap).forEach(([target, build]) =>
      build
        .then(async (context: esbuild.BuildContext) => {
          console.log(`Building .js bundle for ${target} target...`);
          await context.rebuild();
          console.log(`✓ Successfully built ${target}/www/main.js`);
          await context.dispose();
        })
        .catch((e) => {
          console.error(`Build failed for ${target} target:`, e);
          process.exit(1);
        })
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
