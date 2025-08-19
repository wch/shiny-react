import * as esbuild from "esbuild";
import * as fs from "fs";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

const esbuildProblemMatcherPlugin: esbuild.Plugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log(
        `[${watch ? "watch " : ""}${new Date().toISOString()}] building shiny-react library`
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
        `[${watch ? "watch " : ""}${new Date().toISOString()}] build finished`
      );
    });
  },
};

async function main() {
  // Build for CommonJS (main entry)
  const cjsContext = await esbuild.context({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: true,
    external: ["react", "react-dom"],
    logLevel: "silent",
    plugins: [esbuildProblemMatcherPlugin],
  });

  // Build for ES modules (module entry)
  const esmContext = await esbuild.context({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.esm.js",
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: true,
    external: ["react", "react-dom"],
    logLevel: "silent",
  });

  if (watch) {
    await Promise.all([cjsContext.watch(), esmContext.watch()]);
  } else {
    await Promise.all([cjsContext.rebuild(), esmContext.rebuild()]);
    await Promise.all([cjsContext.dispose(), esmContext.dispose()]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});