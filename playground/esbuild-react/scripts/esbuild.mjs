import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";
import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";

async function copyRecursive(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const files = await fs.readdir(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    const fileInfo = await fs.lstat(srcPath);

    if (fileInfo.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const envVars = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
);

const htmlPlugin = {
  name: "html-plugin",
  setup(build) {
    build.onEnd(async (result) => {
      // do not run this in watch mode
      if (process.argv[2] === "watch") {
        return;
      }

      if (result.errors.length > 0) {
        return;
      }

      if (!result.metafile) {
        console.error("Metafile not available");
        return;
      }

      const outputs = Object.keys(result.metafile.outputs);

      const jsOutputs = outputs.filter((file) => file.endsWith(".js") && file.includes("/App-"));
      const cssOutputs = outputs.filter((file) => file.endsWith(".css") && file.includes("/App-"));

      if (jsOutputs.length === 0 || cssOutputs.length === 0) {
        console.error("Could not find entry point outputs");
        return;
      }

      const jsFile = path.basename(jsOutputs[0]);
      const cssFile = path.basename(cssOutputs[0]);

      console.log("Found JS file:", jsFile);
      console.log("Found CSS file:", cssFile);

      const htmlPath = path.join(process.cwd(), "dist", "index.html");
      let html = await fs.readFile(htmlPath, "utf8");

      html = html.replace('"/App.css"', `"/${cssFile}"`);
      html = html.replace('"/App.js"', `"/${jsFile}"`);

      await fs.writeFile(htmlPath, html);
      console.log("Successfully updated index.html with hashed filenames");
    });
  },
};

const defaultOptions = {
  logLevel: "info",
  entryPoints: ["src/App.tsx"],
  bundle: true,
  minify: true,
  publicPath: "/",
  outdir: "dist",
  assetNames: "assets/[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  entryNames: "[dir]/[name]-[hash]",
  splitting: true,
  format: "esm",
  sourcemap: "linked",
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file",
    ".gif": "file",
    // If you're using a `/slim` entrypoint, then you'll have to copy the `.wasm` core as a static asset in your bundle.
    ".wasm": "file",
  },
  plugins: [
    // This will recognize the worker file in @prelude.so/js-sdk as an entrypoint and bundle it
    metaUrlPlugin(),
    htmlPlugin,
  ],
  define: {
    ...envVars,
  },
};

await copyRecursive("public", "dist");

const [, , command] = process.argv;

if (command === "watch") {
  const ctx = await esbuild.context({
    ...defaultOptions,
    minify: false,
    entryNames: "[dir]/[name]",
  });
  await ctx.watch();
  let { host, port } = await ctx.serve({ servedir: "dist" });
  http
    .createServer((req, res) => {
      const options = {
        hostname: host,
        port: port,
        path: req.url,
        method: req.method,
        headers: req.headers,
      };

      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const extensionPattern = /\.[^/]+$/;

      const proxyReq = http.request(options, (proxyRes) => {
        if (proxyRes.statusCode === 404 && extensionPattern.test(urlObj.pathname)) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 - Not Found");
          return;
        }

        if (proxyRes.statusCode === 404) {
          const indexPath = path.join(import.meta.dirname, "../dist", "index.html");

          fs.readFile(indexPath, "utf8")
            .then((data) => {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(data);
            })
            .catch((err) => {
              console.error("Error reading index.html:", err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("500 - Internal Server Error");
            });

          proxyRes.resume();
          return;
        }

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxyReq, { end: true });
    })
    .listen(3000, () => {
      console.log(`listening on http://localhost:3000`);
    });
} else {
  await esbuild.build(defaultOptions);
}
