import * as esbuild from "esbuild";

const config = {
  write: true,
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: `./dist/function.cjs`,
  entryPoints: [`function/index.ts`],
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(config);
  console.log("watching for changes...");
  await context.watch();
} else {
  await esbuild.build(config).catch((err, location) => {
    console.error(err, location);
    process.exit(1);
  });
}
