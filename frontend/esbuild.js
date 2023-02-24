import http from "node:http";
import * as esbuild from "esbuild";
import svelte from "esbuild-svelte";
import postcss from "esbuild-postcss";
import preprocess from "svelte-preprocess";

const ctx = await esbuild.context({
  entryPoints: [`src/app.ts`],
  bundle: true,
  outdir: `./dist`,
  mainFields: ["svelte", "browser", "module", "main"],
  minify: false,
  sourcemap: "inline",
  splitting: true,
  write: true,
  format: `esm`,
  plugins: [postcss(), svelte({ preprocess: preprocess() })],
});

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
  .listen(20231);
