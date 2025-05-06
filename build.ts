import * as esbuild from "esbuild";
import tailwindPlugin from "esbuild-plugin-tailwindcss";
import * as fs from "fs";

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
      if (entryPoints.every((e) => typeof e === "string")) {
        // Case 1: string[] - already an array of strings
        entryPointsInputNames = entryPoints;
      } else if ("in" in entryPoints[0]) {
        // Case 2: array of {in, out} objects
        entryPointsInputNames = entryPoints.map(
          (entry) => (entry as { in: string }).in,
        );
      } else {
        throw new Error(
          "entryPoints is not an array of strings or {in, out} objects",
        );
      }
    } else {
      // Case 3: Record<string, string>
      const record = entryPoints;
      entryPointsInputNames = Object.values(record);
    }

    build.onStart(() => {
      console.log(
        `[${watch ? "watch " : ""}${new Date().toISOString()}] build started ${entryPointsInputNames.join(
          ", ",
        )}`,
      );
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location !== null) {
          console.error(
            `    ${location.file}:${location.line}:${location.column}:`,
          );
        }
      });
      console.log(
        `[${watch ? "watch " : ""}${new Date().toISOString()}] build finished ${entryPointsInputNames.join(
          ", ",
        )}`,
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
                JSON.stringify(result.metafile),
              );
            }
          },
        );
      }
    });
  },
};

async function main() {
  const buildmap = {
    webview: esbuild.context({
      entryPoints: ["src/hello-world/main.tsx", "src/example/main.tsx"],
      outdir: "dist/",
      bundle: true,
      format: "esm",
      minify: production,
      sourcemap: "linked",
      sourcesContent: true,
      tsconfig: "./tsconfig.json",
      external: [],
      logLevel: "silent",
      metafile: metafile,
      plugins: [metafilePlugin, esbuildProblemMatcherPlugin, tailwindPlugin()],
    }),
  };

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
      }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
