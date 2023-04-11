import http from "node:http";
import * as esbuild from "esbuild";
import svelte from "esbuild-svelte";
import postcss from "esbuild-postcss";
import alias from "esbuild-plugin-alias";
import preprocess from "svelte-preprocess";

const config = {
  entryPoints: [`src/app.ts`],
  write: true,
  bundle: true,
  format: `esm`,
  minify: false,
  splitting: true,
  outdir: `./dist`,
  sourcemap: "inline",
  mainFields: ["svelte", "browser", "module", "main"],
  plugins: [
    postcss(),
    svelte({
      preprocess: preprocess({
        postcss: {
          configFilePath: "./postcss.config.cjs",
        },
      }),
      compilerOptions: { css: "injected" },
    }),
    alias({
      "@/*": "./src/*",
      "@/stores/*": "./src/lib/stores/*",
      "@/core/*": "./src/components/core/*",
      "@/foundation/*": "./src/components/foundation/*",
    }),
  ],
};

if (!process.argv.includes(`--watch`)) {
  await esbuild.build(config).catch((err, location) => {
    console.error(err, location);
    process.exit(1);
  });
} else {
  const ctx = await esbuild.context(config);
  const { host, port } = await ctx.serve({ servedir: "./dist" });

  http
    .createServer((req, res) => {
      const opts = {
        port: port,
        path: req.url,
        hostname: host,
        method: req.method,
        headers: req.headers,
      };

      const proxy = http.request(opts, (proxyRes) => {
        if (proxyRes.statusCode === 404) {
          res.writeHead(404, { "Content-Type": "text/html" });
          return res.end("<h1>404</h1>");
        }
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxy, { end: true });
    })
    .listen(20231, () => {
      console.log("Listening on", 20231);
    });
}
